import React, { Component } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import axiosMiddleware from '../../../../core/axios';
import { GET_LOAN_BILL_TEMPLATE_SETTINGS, UPDATE_LOAN_BILL_TEMPLATE, FETCH_AVL_LOAN_BILL_TEMPLATES } from '../../../../core/sitemap';
import { getAccessToken } from '../../../../core/storage';
import { toast } from 'react-toastify';
import { refreshLoanBillTemplateData } from '../../../../utilities/authUtils';
import { constructApiAssetUrl } from '../../../../utilities/utility';
import LoanBillMainTemplate from '../../../../templates/loanBill/LoanBillMainTemplate';
import './loanBillTemplateSettings.scss';
import CommonModal from '../../../common-modal/commonModal.jsx';
import ReactToPrint from 'react-to-print';
import ImageZoom from 'react-medium-image-zoom';


const sampleBillContent = {
    amount: 10000,
    presentValue: 10500,
    billSeries: 'A',
    billNo: 1425,
    date: '2021-01-10 11:11:37',
    expiryDate: '2022-01-11 11:11:37',
    cname: 'RAJ KUMAR',
    gaurdianName: 'GOVINDRAJ',
    address: "3/3 K.K NGR 2ND CROSS STREET",
    place: "KATTUPAKKAM",
    city: "CHENNAI",
    pinCode: "600056",
    mobile: '8148588004',
    userPicture: {imageId: 1 , url: "http://localhost:3003/uploads/system/user-male.png"},
    ornPicture: {imageId: 1 , url: "http://localhost:3003/uploads/system/default-orn.webp"},
    orn: {
        1: {ornItem: "G Ring", ornNWt: "4.2", ornNos: "1", ornSpec: ""},
        // 2: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 3: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 4: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 5: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 6: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 7: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 8: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 9: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 10: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 11: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
        // 12: {ornItem: "G Ring", ornNWt: "", ornNos: "1", ornSpec: ""},
    },
};
export default class LoanBillTemplateSettings extends Component {
    constructor(props) {
        super(props);
        this.domElmns = {};
        this.state = {
            firstLine: {
                left: {
                    text: ''
                },
                center: {
                    text: ''
                },
                right: {
                    text: ''
                },
                styles: {
                    marginTop: null,
                    marginBottom: null,
                    marginRight: null,
                    marginLeft: null
                }
            },
            secondLine: {
                text: '',
                styles: {
                    fontSize: null,
                    letterSpacing: null,
                    color: null
                }
            },
            thirdLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
            fourthLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
            fifthLine: {
                text: '',
                styles: {
                    fontSize: null
                }
            },
            userImageColoured: false,
            ornImageColoured: false,
            bodyTemplateId: null,
            avlTemplates: [],
            currBillContent: {}
        }
        this.bindMethods();
    }
    bindMethods() {
        this.updateDB = this.updateDB.bind(this);
        this.updateStateObj = this.updateStateObj.bind(this);
        this.showPreview = this.showPreview.bind(this);
        this.handlePreviewClose = this.handlePreviewClose.bind(this);
        this.printClick = this.printClick.bind(this);
    }
    componentDidMount() {
        this.fetchSettings();
        this.fetchAvlTemplates();
    }
    async fetchSettings() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${GET_LOAN_BILL_TEMPLATE_SETTINGS}?access_token=${at}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP) {
                this.updateStateObj(resp.data.RESP);
            }
        } catch(e) {
            console.error(e);
        }
    }
    async fetchAvlTemplates() {
        try {
            let at = getAccessToken();
            let resp = await axiosMiddleware.get(`${FETCH_AVL_LOAN_BILL_TEMPLATES}?access_token=${at}`);
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS' && resp.data.RESP) {
                let newState = {...this.state};
                newState.avlTemplates = resp.data.RESP;
                this.setState(newState);
            }
        } catch(e) {
            console.error(e);
        }
    }
    updateStateObj(respData) {
        let headerObj = JSON.parse(respData.header);
        let newState = {...this.state};

        newState.firstLine.left.text = headerObj.firstLine.left.text
        newState.firstLine.center.text = headerObj.firstLine.center.text;
        newState.firstLine.right.text = headerObj.firstLine.right.text;
        newState.firstLine.styles.marginTop = headerObj.firstLine.styles.marginTop;
        newState.firstLine.styles.marginBottom = headerObj.firstLine.styles.marginBottom;
        newState.firstLine.styles.marginRight = headerObj.firstLine.styles.marginRight;
        newState.firstLine.styles.marginLeft = headerObj.firstLine.styles.marginLeft;
        
        newState.secondLine = headerObj.secondLine;

        newState.thirdLine.text = headerObj.thirdLine.text;
        newState.thirdLine.styles.fontSize = headerObj.thirdLine.styles.fontSize;

        newState.fourthLine.text = headerObj.fourthLine.text;
        newState.fourthLine.styles.fontSize = headerObj.fourthLine.styles.fontSize;

        newState.fifthLine.text = headerObj.fifthLine.text;
        newState.fifthLine.styles.fontSize = headerObj.fifthLine.styles.fontSize;

        let other = JSON.parse(respData.other);
        if(Object.keys(other).length > 0) {
            newState.userImageColoured = other.userImageColoured;
            newState.ornImageColoured = other.ornImageColoured;
        }
        newState.bodyTemplateId = respData.bodyTemplate;
        this.setState(newState);
    }
    onChangeFirstLine(val, part) {
        let newState = {...this.state};
        newState.firstLine[part].text = val;
        this.setState(newState);
    }
    onChangeFirstLineStyle(val, part) {
        let newState = {...this.state};
        newState.firstLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeSecondLine(val) {
        let newState = {...this.state};
        newState.secondLine.text = val;
        this.setState(newState);
    }
    onChangeSecondLineStyles(val, part) {
        let newState = {...this.state};
        newState.secondLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeThirdLine(val) {
        let newState = {...this.state};
        newState.thirdLine.text = val;
        this.setState(newState);
    }
    onChangeThirdLineStyles(val, part) {
        let newState = {...this.state};
        newState.thirdLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeFourthLine(val) {
        let newState = {...this.state};
        newState.fourthLine.text = val;
        this.setState(newState);
    }
    onChangeFourthLineStyles(val, part) {
        let newState = {...this.state};
        newState.fourthLine.styles[part] = val;
        this.setState(newState);
    }
    onChangeFifthLine(val) {
        let newState = {...this.state};
        newState.fifthLine.text = val;
        this.setState(newState);
    }
    onChangeFifthLineStyles(val, part) {
        let newState = {...this.state};
        newState.fifthLine.styles[part] = val;
        this.setState(newState);
    }
    imageColorSetting(e, identifier) {
        let newState = {...this.state};
        switch(identifier) {
            case 'user':
                newState.userImageColoured = !newState.userImageColoured;
                break;
            case 'orn':
                newState.ornImageColoured = !newState.ornImageColoured;
                break;
        }
        this.setState(newState);
    }
    onChangeTemplateId(val) {
        let newState = {...this.state};
        newState.bodyTemplateId = val;
        this.setState(newState);
    }
    getApiParamsForUpdate() {
        let cntxt = {
            firstLine: {
                left: {
                    text: this.state.firstLine.left.text
                },
                center: {
                    text: this.state.firstLine.center.text
                },
                right: {
                    text: this.state.firstLine.right.text
                },
                styles: {
                    marginTop: this.state.firstLine.styles.marginTop,
                    marginBottom: this.state.firstLine.styles.marginBottom,
                    marginRight: this.state.firstLine.styles.marginRight,
                    marginLeft: this.state.firstLine.styles.marginLeft
                }
            },
            secondLine: this.state.secondLine,
            thirdLine: {
                text: this.state.thirdLine.text,
                styles: {
                    fontSize: this.state.thirdLine.styles.fontSize
                }
            },
            fourthLine: {
                text: this.state.fourthLine.text,
                styles: {
                    fontSize: this.state.fourthLine.styles.fontSize
                }
            },
            fifthLine: {
                text: this.state.fifthLine.text,
                styles: {
                    fontSize: this.state.fifthLine.styles.fontSize
                }
            }
        };
        let other = {
            userImageColoured: this.state.userImageColoured,
            ornImageColoured: this.state.ornImageColoured
        }
        return {headerSettings: cntxt, other: other, bodyTemplateId: this.state.bodyTemplateId};
    }
    async updateDB() {
        try {
            let resp = await axiosMiddleware.post(UPDATE_LOAN_BILL_TEMPLATE, this.getApiParamsForUpdate());
            if(resp && resp.data && resp.data.STATUS == 'SUCCESS')
                toast.success('Updated Successfully!');
            refreshLoanBillTemplateData();    
        } catch(e) {
            toast.error('Error!');
            console.log(e);
        }
    }
    onChangeTemplateSelection(e, id) {
        this.setState({bodyTemplateId: id});
    }
    showPreview() {
        this.setState({showPreview: true, currBillContent: sampleBillContent});
    }
    handlePreviewClose() {
        this.setState({showPreview: false, currBillContent: {}});
    }
    printClick() {
        this.domElmns.printBtn.handlePrint();
    }

    getTemplateListSelectionContainer() {
        let templatesContainer = [];
        _.each(this.state.avlTemplates, (aTemplate, index) => {
            let checked = false;
            if(aTemplate.template_id == this.state.bodyTemplateId)
                checked = true;

            let theUrl = aTemplate.screenshot_url;

            templatesContainer.push(
                <Col xs={3} md={3}>
                    <div className="screenshot-prview-container">
                        <ImageZoom>
                            <img src={theUrl} alt='Image not found' className='template-image-viewer'/>
                        </ImageZoom>
                    </div>
                    <div className="screenshot-radio-btn-label">
                        <input type="radio" id={`loan-bill-body-template-id-${index}`} name="loan-bill-body-template" onChange={(e)=>this.onChangeTemplateSelection(e, aTemplate.template_id)} value={aTemplate.template_id} checked={checked}/>
                        <label for={`loan-bill-body-template-id-${index}`}>{aTemplate.template_id}</label>
                    </div>
                </Col>
            )
        });
        return (
            <div>
                {templatesContainer}
            </div>
        )
    }
    render() {
        return (
            <div className="bill-creation-temlpate-setup">
                <Row className="gs-card">
                    <Col clasName="gs-card-content">
                        {/* <Col> */}
                            <Row>
                                <Col xs={{span: 6}} md={{span: 6}} className="card-heading-text-col">
                                    <h3 style={{marginBottom: '30px'}}>Loan Bill - Templete Setup</h3>
                                </Col>
                                <Col xs={{span: 6}} md={{span: 6}} className="action-container1">
                                    <input type='button' className='gs-button' value='PREVIEW' onClick={this.showPreview}/>
                                </Col>
                                <CommonModal modalOpen={this.state.showPreview} handleClose={this.handlePreviewClose} secClass="bill-template-preview-modal">
                                    <ReactToPrint
                                        ref={(domElm) => {this.domElmns.printBtn = domElm}}
                                        trigger={() => <a href="#"></a>}
                                        content={() => this.componentRef}
                                        className="print-hidden-btn"
                                    />
                                    <input type="button" className="gs-button" onClick={this.printClick} value="PRINT" />
                                    <LoanBillMainTemplate ref={el => (this.componentRef = el)} currBillContent={this.state.currBillContent} handleClose={this.handlePreviewClose}/>
                                </CommonModal>
                            </Row>
                            <Row>
                                <Col xs={12} className="first-line-header">
                                    <h5 style={{textAlign: 'center'}}>FIRST LINE</h5>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group>
                                        <Form.Label>Left <span className="normal-font">(Ex: Form F (Sec. 7 - Rule8))</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.firstLine.left.text}
                                            onChange={(e) => this.onChangeFirstLine(e.target.value, 'left')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group>
                                        <Form.Label>Center <span className="normal-font">(Ex: PAWN TICKET)</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.firstLine.center.text}
                                            onChange={(e) => this.onChangeFirstLine(e.target.value, 'center')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group>
                                        <Form.Label>Right <span className="normal-font">(Ex: PBL No. 1234/5678/90/12)</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.firstLine.right.text}
                                            onChange={(e) => this.onChangeFirstLine(e.target.value, 'right')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            {/* <Row className="first-line-style-input-row">
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Top</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginTop}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginTop')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Bottom</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginBottom}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginBottom')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Right</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginRight}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginRight')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={3}>
                                    <Form.Group>
                                        <Form.Label>Margin-Left</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={this.state.firstLine.styles.marginLeft}
                                            onChange={(e) => this.onChangeFirstLineStyle(e.target.value, 'marginLeft')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row> */}
                            <Row className="second-line-row">
                                <Col xs={12} className="second-line-header">
                                    <h5 style={{textAlign: 'center'}}>SECOND LINE</h5>
                                </Col>
                                <Col xs={4} md={4}>
                                    <Form.Group>
                                        <Form.Label>Enter Your Store Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.secondLine.text}
                                            onChange={(e) => this.onChangeSecondLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size <span className="normal-font">(Ex: 20)</span></Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder=""
                                                    value={this.state.secondLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeSecondLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={4} md={4}>
                                            <Form.Group>
                                                <Form.Label>Letter Spacing <span className="normal-font">(Ex: 1)</span></Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder=""
                                                    value={this.state.secondLine.styles.letterSpacing}
                                                    onChange={(e) => this.onChangeSecondLineStyles(e.target.value, 'letterSpacing')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Color <span className="normal-font">(Ex: red)</span></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder=""
                                                    value={this.state.secondLine.styles.color}
                                                    onChange={(e) => this.onChangeSecondLineStyles(e.target.value, 'color')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="third-line-row">
                                <Col xs={12} className="third-line-header">
                                    <h5 style={{textAlign: 'center'}}>THIRD LINE</h5>
                                </Col>
                                <Col xs={4} md={4}>
                                    <Form.Group>
                                        <Form.Label>Enter Second Line Address <span className="normal-font">(Ex: PAWN BROKER)</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="PAWN BROKER"
                                            value={this.state.thirdLine.text}
                                            onChange={(e) => this.onChangeThirdLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="20"
                                                    value={this.state.thirdLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeThirdLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="fourth-line-row">
                                <Col xs={12} className="fourth-line-header">
                                    <h5 style={{textAlign: 'center'}}>FOURTH LINE</h5>
                                </Col>
                                <Col xs={4} md={4}>
                                    <Form.Group>
                                        <Form.Label>Enter AddressLine 1 <span className="normal-font"> (Ex: 2/3 Main Road)</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.fourthLine.text}
                                            onChange={(e) => this.onChangeFourthLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size <span className="normal-font">(Ex: 20)</span></Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder=""
                                                    value={this.state.fourthLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeFourthLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="fifth-line-row">
                                <Col xs={12} className="fifth-line-header">
                                    <h5 style={{textAlign: 'center'}}>FIFTH LINE</h5>
                                </Col>
                                <Col xs={4} md={4}>
                                    <Form.Group>
                                        <Form.Label>Enter AddressLine 2  <span className="normal-font">(Ex: Kattupakkam, Ch-600056)</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="ADDRESS LINE 2"
                                            value={this.state.fifthLine.text}
                                            onChange={(e) => this.onChangeFifthLine(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Row>
                                        <Col xs={3} md={3}>
                                            <Form.Group>
                                                <Form.Label>Font Size <span className="normal-font">(Ex: 20)</span></Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    placeholder=""
                                                    value={this.state.fifthLine.styles.fontSize}
                                                    onChange={(e) => this.onChangeFifthLineStyles(e.target.value, 'fontSize')}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="image-color-setting">
                                <Col xs={12} md={12}>
                                    <Row>
                                        <Col xs={12} className="image-color-setting-header">
                                            <h5 style={{textAlign: 'center'}}>Image Color Setting</h5>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={8} md={8}>
                                            <Form.Group>
                                                <Form.Check id='' type='checkbox' checked={this.state.userImageColoured} value="" label='User Image - Coloured' onChange={(e)=>this.imageColorSetting(e, 'user')}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={8} md={8}>
                                            <Form.Group>
                                                <Form.Check id='' type='checkbox' checked={this.state.ornImageColoured} value="" label='Orn Image - Coloured' onChange={(e)=>this.imageColorSetting(e, 'orn')}/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={12} className="template-list-col">
                                    <h5 style={{textAlign: 'center'}}>Content Template</h5>
                                    {this.getTemplateListSelectionContainer()}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={{span: 12}} md={{span: 12}} style={{textAlign: 'right'}}>
                                    <input type='button' className='gs-button' value='UPDATE' onClick={this.updateDB}/>
                                </Col>
                            </Row>
                        {/* </Col> */}
                    </Col>
                </Row>
            </div>
        )
    }
}