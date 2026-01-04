import { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FETCH_AVL_JEWELLERY_TAG_TEMPLATES, UPDATE_JEWELLERY_TAG_SETTINGS } from '../../../core/sitemap';
import { getAccessToken, getJewelleryTagTemplateSettings, saveJewelleryTagTemplateSettings } from '../../../core/storage';
import axiosMiddleware from '../../../core/axios';
import TagTemplateRenderer from '../../../templates/jewellery-tag/templateRenderer';
import './TagSetup.scss';
import _ from 'lodash';
import { toast } from 'react-toastify';
import {useReactToPrint} from 'react-to-print';
import { safeParseJson } from '../../../utilities/utility';

const TagSetup = () => {
    // let btnRef = useRef();
    // let selectedTagRef = useRef(null);

    const [templatesList, setTemplatesList] = useState([]);

    const [storeName, setStoreNameAbbr] = useState(null);
    const [storeNameFull, setStoreNameFull] = useState(null);
    const [division, setDivision] = useState('22K');
    const [grams, setGrams] = useState(1.240);
    const [size, setSize] = useState(22);
    const [itemName, setItemName] = useState('RING');
    const [huid, setHuid] = useState('HJ7l5K');
    const [productId, setProductId] = useState('RN2');
    const [trackId, setTrackId] = useState('104');
    const [wsgPct, setWsgPct] = useState('14%');
    const [bisLogoVisibility, setBisLogoVisibility] = useState(false);
    
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);

    const printPreviewContentRef = useRef(null);
    const printPreviewReactToPrintFn = useReactToPrint({ contentRef: printPreviewContentRef });


    const onToggleBisLogoCheckbox = (e) => {
        setBisLogoVisibility(!bisLogoVisibility);
    }

    useEffect(() => {
        fetchAvlTemplates();
    }, []);

    useEffect(() => {
        _.each(templatesList, (aTemplate) => {
            if(aTemplate.template_id == selectedTemplateId) {
                if(!storeName) {
                    if(aTemplate.store_name_abbr)
                        setStoreNameAbbr(aTemplate.store_name_abbr);
                    else
                        setStoreNameAbbr('STR');
                }
                if(!storeNameFull) {
                    if(aTemplate.store_name_full)
                        setStoreNameFull(aTemplate.store_name_full);
                    else
                        setStoreNameFull('MY STORE NAME');
                }
            }
        });
    }, [templatesList, selectedTemplateId]);

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
            let resp = await axiosMiddleware.put(UPDATE_JEWELLERY_TAG_SETTINGS, {selectedTemplateId, storeNameAbbr: storeName, storeNameFull: storeNameFull});
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS') {
                toast.success('Updated Successfully!');
                let tagTemplateSettings = getJewelleryTagTemplateSettings();
                tagTemplateSettings.selected_tag_template_id = selectedTemplateId;
                tagTemplateSettings.store_name_abbr = storeName;
                tagTemplateSettings.store_name_full = storeNameFull;
                saveJewelleryTagTemplateSettings(tagTemplateSettings);
            } else {
                console.log(e);
                toast.error('Error while update the tag selection.');
            }
        } catch(e) {
            console.log(e);
        }
    }

    const onClickPrintBtn = () => {
        // btnRef.handlePrint();
    }

    const getTemplateListContainer = () => {
        let list = [];
        let tagContext = [{
            storeName: storeName,
            storeNameFull: storeNameFull,
            division: division,
            displayBisLogo: bisLogoVisibility,
            grams: grams,
            size: size,
            itemName: itemName,
            huid: huid,
            config: {
                showBis: true,
            },
            productId: productId,
            trackId,
            wsgPct
        }];
        _.each(templatesList, (aTemplate) => {
            let checked = false;
            if(aTemplate.template_id == selectedTemplateId) {
                checked = true;
            }
            let labelStr = aTemplate.template_id;
            let paramertsJson = safeParseJson(aTemplate.parameters_json);
            if(paramertsJson) {
                labelStr = `${paramertsJson.labelWidth}MM X ${paramertsJson.labelHeight}MM`;
            }
            list.push(
                <Col xs={6} md={6} className='a-tag-preview'>
                    <div className="jewellery-tag-radio-btn-label">
                        <input type="radio" id={`jewellery-tag-template-id-${aTemplate.template_id}`} name="jewellery-tag-template" onChange={(e)=>onChangeTemplateSelection(e, aTemplate.template_id)} value={aTemplate.template_id} checked={checked}/>
                        <label for={`jewellery-tag-template-id-${aTemplate.template_id}`} style={{marginLeft: '7px'}}>
                            {labelStr}
                        </label>
                    </div>
                    <div ref={printPreviewContentRef}>
                        <TagTemplateRenderer 
                            // ref={(el)=>{
                            //     if(checked) selectedTagRef=el;
                            // }} 
                            templateId={aTemplate.template_id} 
                            content={tagContext}
                            />
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
                        <Col xs={3}>
                            <Row>
                                <Col xs={6}>
                                    StoreName: 
                                </Col>
                                <Col xs={6}>
                                    <input type="text" className="gs-input-cell" value={storeName} onChange={(e) => setStoreNameAbbr(e.target.value)}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6}>
                                    StoreName Full: 
                                </Col>
                                <Col xs={6}>
                                    <input type="text" className="gs-input-cell" value={storeNameFull} onChange={(e) => setStoreNameFull(e.target.value)}/>
                                </Col>
                            </Row>
                            <div className='tag-variable-input-items'>
                                <Row>
                                    <Col xs={6}>
                                        Track Id: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={trackId} onChange={(e) => setTrackId(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        Product Id: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={productId} onChange={(e) => setProductId(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        HUID: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={huid} onChange={(e) => setHuid(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        Item Name: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={itemName} onChange={(e) => setItemName(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        Division: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={division} onChange={(e) => setDivision(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        Show BIS Logo
                                    </Col>
                                    <Col xs={6}>
                                        <input type='checkbox' 
                                        style={{
                                            marginTop: '8px',
                                            marginBottom: '7px',
                                            marginLeft: 0
                                        }}
                                        value={''} checked={bisLogoVisibility} onChange={(e) => onToggleBisLogoCheckbox(e)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        grams: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={grams} onChange={(e) => setGrams(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        size: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={size} onChange={(e) => setSize(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        Wsg %: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={wsgPct} onChange={(e) => setWsgPct(e.target.value)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        HUID: 
                                    </Col>
                                    <Col xs={6}>
                                        <input type="text" className="gs-input-cell" value={huid} onChange={(e) => setHuid(e.target.value)}/>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                        <Col xs={9}>
                            <Row style={{marginTop: '20px'}}>
                                {getTemplateListContainer()}
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span: 6, offset: 6}} style={{textAlign: 'right'}}>
                            {/* <ReactToPrint 
                                ref={(domElm) => {btnRef = domElm}}
                                trigger={() => <a href="#"></a>}
                                content={() => selectedTagRef}
                            /> */}
                            <input type="button" className="gs-button bordered" value="PRINT PREVIEW" onClick={printPreviewReactToPrintFn} />
                            <input type="button" className='gs-button bordered' style={{marginLeft: '10px'}} value="UPDATE" onClick={onClickUpdate}/>
                        </Col>
                    </Row>
                </Col>

            </Row>
        </div>
    )
}

export default TagSetup;
