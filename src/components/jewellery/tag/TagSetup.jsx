import { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FETCH_AVL_JEWELLERY_TAG_TEMPLATES, UPDATE_JEWELLERY_TAG_SETTINGS } from '../../../core/sitemap';
import { getAccessToken } from '../../../core/storage';
import axiosMiddleware from '../../../core/axios';
import TagTemplateRenderer from '../../../templates/jewellery-tag/templateRenderer';
import './TagSetup.scss';
import _ from 'lodash';
import { toast } from 'react-toastify';
import ReactToPrint from 'react-to-print';

const TagSetup = () => {
    let btnRef = useRef();
    let selectedTagRef = useRef(null);

    const [templatesList, setTemplatesList] = useState([]);

    const [storeName, setStoreNameAbbr] = useState('MJK');
    const [division, setDivision] = useState('916KDM');
    const [grams, setGrams] = useState(1.240);
    const [size, setSize] = useState(22);
    const [itemName, setItemName] = useState('');
    const [huid, setHuid] = useState('HJ7l5K');
    
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);


    useEffect(() => {
        fetchAvlTemplates();
    }, []);

    useEffect(()=> {
        _.each(templatesList, (aTemplate) => {
            if(aTemplate.selected_tag_template_id) setSelectedTemplateId(aTemplate.template_id);
        });
    },[templatesList]);

    const fetchAvlTemplates = async () => {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_AVL_JEWELLERY_TAG_TEMPLATES}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.TAG_TEMPLATES) {
                setTemplatesList(resp.data.TAG_TEMPLATES);
            }
        } catch(e) {
            console.error(e);
        }
    }

    const onChangeTemplateSelection = (e, templateId) => {
        console.log('-----Changed', templateId);
        setSelectedTemplateId(templateId);
    }

    const onClickUpdate = async () => {
        try {
            let resp = await axiosMiddleware.put(UPDATE_JEWELLERY_TAG_SETTINGS, {selectedTemplateId});
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') toast.success('Updated Successfully');
            else {
                console.log(e);
                toast.error('Error while update the tag selection.');
            }
        } catch(e) {
            console.log(e);
        }
    }

    const onClickPrintBtn = () => {
        btnRef.handlePrint();
    }

    const getTemplateListContainer = () => {
        let list = [];
        let tagContext = [{
            storeName: storeName,
            division: division,
            grams: grams,
            size: size,
            itemName: itemName,
            huid: huid,
            config: {
                showBis: true,
            }
        }];
        _.each(templatesList, (aTemplate) => {
            let checked = false;
            console.log('CONDITINO CHeck', selectedTemplateId);
            if(aTemplate.template_id == selectedTemplateId) {
                checked = true;
                console.log('CHECKED = ', aTemplate.template_id );
            }
            list.push(
                <Col xs={6} md={6}>
                    <TagTemplateRenderer 
                        ref={(el)=>{selectedTagRef=el}} 
                        templateId={aTemplate.template_id} 
                        content={tagContext}
                        />
                    <div className="jewellery-tag-radio-btn-label">
                        <input type="radio" id={`jewellery-tag-template-id-${aTemplate.template_id}`} name="jewellery-tag-template" onChange={(e)=>onChangeTemplateSelection(e, aTemplate.template_id)} value={aTemplate.template_id} checked={checked}/>
                        <label for={`jewellery-tag-template-id-${aTemplate.template_id}`}>{aTemplate.template_id}</label>
                    </div>
                </Col>
            )
        });
        return list;
    }

    return (
        <div className="jewellery-tag-template-setup-container">
            <Row className="gs-card">
                <Col className="gs-card-content">
                    <h4 style={{marginBottom: '20px'}}>Tag Templates</h4>
                    <Row>
                        <Col xs={1}>
                            StoreName: 
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={storeName} onChange={(e) => setStoreNameAbbr(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={1}>
                            Division: 
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={division} onChange={(e) => setDivision(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={1}>
                            grams: 
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={grams} onChange={(e) => setGrams(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={1}>
                            size: 
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={size} onChange={(e) => setSize(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={1}>
                            HUID: 
                        </Col>
                        <Col xs={2}>
                            <input type="text" className="gs-input-cell" value={huid} onChange={(e) => setHuid(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        {getTemplateListContainer()}
                    </Row>
                    <Row>
                        <Col xs={6} style={{textAlign: 'left'}}>
                            <ReactToPrint 
                                ref={(domElm) => {btnRef = domElm}}
                                trigger={() => <a href="#"></a>}
                                content={() => selectedTagRef}
                            />
                            <input type="button" className="gs-button" value="PRINT" onClick={onClickPrintBtn} />
                        </Col>
                        <Col xs={6} style={{textAlign: 'right'}}>
                            <input type="button" className='gs-button' value="UPDATE" onClick={onClickUpdate}/>
                        </Col>
                    </Row>
                </Col>

            </Row>
        </div>
    )
}

export default TagSetup;
