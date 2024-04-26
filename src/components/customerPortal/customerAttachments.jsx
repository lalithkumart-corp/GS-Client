import React, { useState, useEffect } from 'react';
import { Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { FaCross, FaEdit, FaSave, FaTrash } from 'react-icons/fa';

import axiosMiddleware from '../../core/axios';
import {
    GET_CUSTOMER_ATTACHMENT_LIST,
    INSERT_NEW_CUSTOMER_ATTACHMENT_ENTRY,
    DELETE_CUSTOMER_ATTACHMENT_ENTRY,
    SAVE_BINARY_IMAGE_AND_GET_ID,
    SAVE_BASE64_IMAGE_AND_GET_ID,
    DEL_IMAGE_BY_ID
} from '../../core/sitemap';
import { getAccessToken } from '../../core/storage';
import _ from 'lodash';
import Picture from '../profilePic/picture';
import { defaultPictureState } from '../billcreate/helper';

let defaultImageState = JSON.parse(JSON.stringify(defaultPictureState));
defaultImageState.caption.show = true;

const CustomerAttachments = (props) => {
    const [picData, setPicData] = useState(JSON.parse(JSON.stringify(defaultImageState)));
    const [custId, setCustId] = useState(props.selectedCust?.custId);
    const [attachmentsList, setAttachmentsList] = useState([]);

    useEffect(() => {
        if (props.selectedCust.customerId)
            setCustId(props.selectedCust.customerId);
    }, [props.selectedCust?.customerId]);

    useEffect(() => {
        if (custId) {
            setPicData(JSON.parse(JSON.stringify(defaultImageState)));
            fetchListOfAttachments();
        }
    }, [custId]);

    const refreshAttachmentList = () => {
        fetchListOfAttachments();
    }

    const fetchListOfAttachments = async () => {
        const resp = await axiosMiddleware.get(`${GET_CUSTOMER_ATTACHMENT_LIST}?customer_id=${custId}`);
        console.log(resp.data.RESP.list);
        _.each(resp.data.RESP.list, (obj, i) => {
            obj._ = {};
            obj._.captionEditable = false;
            obj._.displayEditBtn = true;
            obj._.displayCancelBtn = false;
            obj._.displaySaveBtn = false;
        });
        setAttachmentsList(resp.data.RESP.list);
    };

    const updatePictureData = async (picture, action, imageId) => {
        setPicData(picture);
        let uploadedImageDetail = null;
        if (action == 'save') {
            let reqParams = {};
            if (picture.holder.file) {
                reqParams = new FormData();
                reqParams.append('imgContentType', 'file'); //Type of image contetn passed to API
                reqParams.append('storeAs', 'FILE'); // Suggesting API to save in mentioned format
                reqParams.append('pic', picture.holder.file); // Image content
                reqParams.append('imgCategory', 'CUSTOMER_ATTACHMENT');
                reqParams.append('caption', picture.caption.inputVal);
                uploadedImageDetail = await axiosMiddleware.post(SAVE_BINARY_IMAGE_AND_GET_ID, reqParams);
            } else {
                reqParams.imgContentType = 'base64'; //Type of image contetn passed to API
                reqParams.storeAs = 'FILE'; // Suggesting API to save in mentioned format                
                reqParams.format = picture.holder.confirmedImgSrc.split(',')[0];
                reqParams.pic = picture.holder.confirmedImgSrc.split(',')[1]; // Image content
                reqParams.imgCategory = 'CUSTOMER_ATTACHMENT';
                reqParams.caption = picture.caption.inputVal;
                uploadedImageDetail = await axiosMiddleware.post(SAVE_BASE64_IMAGE_AND_GET_ID, reqParams);
            }
            picture.loading = false;
            picture.id = uploadedImageDetail.data.ID;
            picture.url = uploadedImageDetail.data.URL;
            await insertCustomerAttachmentEntry(picture);
            setPicData(defaultImageState);
            refreshAttachmentList();
        } else if (action == 'del') {
            if (imageId) {
                picture.loading = true;
                setPicData(picture);
                await axiosMiddleware.delete(DEL_IMAGE_BY_ID, { data: { imageId: imageId } });
            }
            picture.loading = false;
            picture.id = null;
            picture.url = null;
            picture.caption.inputVal = '';
            picture.holder = JSON.parse(JSON.stringify(defaultImageState.holder));
            setPicData(picture);
            deleteCustomerAttachmentEntry(picture);
        } else if (action == 'caption') {
            setPicData(picture);
        }
    }

    const insertCustomerAttachmentEntry = async (picture) => {
        const resp = await axiosMiddleware.put(INSERT_NEW_CUSTOMER_ATTACHMENT_ENTRY, { customerId: custId, imageId: picture.id });
        console.log(resp.data);
    }

    const deleteCustomerAttachmentEntry = async (picture) => {
        const resp = await axiosMiddleware.delete(DELETE_CUSTOMER_ATTACHMENT_ENTRY, { customerId: custId, imageId: picture.id });
        console.log(resp.data);
    }

    const onClickTrashAttachment = async (e, i, params) => {
        let result = window.confirm("Sure to delete? You will not be able to restore this attachment.");
        if (result == true) {
            await axiosMiddleware.delete(DEL_IMAGE_BY_ID, { data: { imageId: params.imageId, imgCategory: 'CUSTOMER_ATTACHMENT' } });
            await axiosMiddleware.delete(DELETE_CUSTOMER_ATTACHMENT_ENTRY, {data: { imageId: params.imageId, customerId: params.customerId }});
            refreshAttachmentList();
        }
    }

    const getImageCardsDom = () => {
        const dom = [];
        dom.push(
            <Col xs={3} md={3}>
                <Row>
                    <Picture picData={picData} updatePictureData={updatePictureData} canShowActionButtons={true} />
                </Row>
            </Col>
        );
        _.each(attachmentsList, (obj, i) => {
            console.log(JSON.stringify(obj._));
            dom.push(
                <Col xs={3} md={3} key={'img-attachment-col-key-' + i}>
                    {/* <input type='text' value={obj.imageCaption} readOnly={obj._.captionEditable?'':'readonly'} onChange={(e) => onChangeCaption(e, i)} /> */}
                    <p>{obj.imageCaption}</p>
                    <img src={obj.imagePath} style={{ width: '100%' }} key={'img-key-' + i} />
                    <span onClick={(e) => onClickTrashAttachment(e, i, { imageId: obj.imageId, customerId: obj.customerId })}>
                        <FaTrash />
                    </span>
                    {/* <div>
                        <span className="gs-icon" style={{position: 'absolute', right: 0}} onClick={(e) => onClickCaptionEditIcon(e, i)}>
                            <FaEdit style={{ display: obj._.displayEditBtn?'block':'none'}}/>
                        </span>
                        <span className="gs-icon" style={{position: 'absolute', right: 0}} onClick={(e) => onClickCaptionCancelIcon(e, i)}>
                            <FaCross style={{ display: obj._.displayCancelBtn?'block':'none'}}/>
                        </span>
                        <span className="gs-icon" style={{position: 'absolute', right: 0}} onClick={(e) => onClickCaptionSaveIcon(e, i)}>
                            <FaSave style={{ display: obj._.displaySaveBtn?'block':'none'}}/>
                        </span>
                    </div> */}
                </Col>
            );
        });
        return dom;
    };

    return (
        <>
            {getImageCardsDom()}
        </>
    )
}

export default CustomerAttachments;
