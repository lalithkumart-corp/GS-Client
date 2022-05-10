import React, { Component, useEffect, useState } from 'react';
import { Container, Row, Col, FormGroup, FormLabel, FormControl, HelpBlock, InputGroup, Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import { useQuill } from 'react-quilljs';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css'; // Add css for snow theme
// or import 'quill/dist/quill.bubble.css'; // Add css for bubble theme

import { getAccessToken } from '../../core/storage';
import axios from 'axios';
import { FETCH_NOTES, INSERT_NOTE, UPDATE_NOTE, ARCHIVE_NOTE }  from '../../core/sitemap';
import _ from 'lodash';
import { convertToLocalTime } from '../../utilities/utility';
import './notes.css';
import axiosMiddleware from '../../core/axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';

class Notes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            custDetail: this.props.selectedCust || null,
            showNewPaper: false,
        }
        this.onClickAddNoteBtn = this.onClickAddNoteBtn.bind(this);
        this.saveNewNoteContent = this.saveNewNoteContent.bind(this);
        this.updateNoteContent = this.updateNoteContent.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.discardNewNote = this.discardNewNote.bind(this);
        this.editNoteListener = this.editNoteListener.bind(this);
        this.closeNewPaper = this.closeNewPaper.bind(this);
        this.deleteNoteListener = this.deleteNoteListener.bind(this);
    }

    async componentWillReceiveProps(nextProps, a, c) {
        this.setState({billHistory: nextProps.billHistory});
        if(this.state.custDetail.customerId !== nextProps.selectedCust.customerId) {
            await this.setState({custDetail: nextProps.selectedCust});
            this.fetchNotesFromDB();
        } else {
            //this.setState({custDetail: nextProps.selectedCust});
        }            
    }

    componentDidMount() {
        this.fetchNotesFromDB();        
    }

    async fetchNotesFromDB() {
        let notes = await this.getNotes();
        notes.forEach(noteObj => noteObj.readOnly = true);
        this.setState({notes: notes});
    }

    async getNotes() {
        try {
            let accessToken = getAccessToken();
            let response = await axios.get(FETCH_NOTES + `?access_token=${accessToken}&customer_id=${this.state.custDetail.customerId}`);            
            return response.data.DATA;
        } catch(e) {
            console.log(e);
            alert('Exception occured while fetching notes....See console...');
            return [];
        }        
        
    }

    onClickAddNoteBtn() {
        this.setState({showNewPaper: true});
    }

    async saveNewNoteContent(noteHtmlContent) {
        try {
            let resp = await axiosMiddleware.post(INSERT_NOTE, {content: noteHtmlContent, custKey: '', content: noteHtmlContent, customerId: this.state.custDetail.customerId });
            if(resp.data && resp.data.STATUS == 'ERROR') {
                toast.error('Error: while saving notes');
            } else if(resp.data && resp.data.STATUS == 'EXCEPTION') {
                toast.error('Exception while saving notes');
            } else {
                toast.success('Notes has been saved Successfully');
                this.refreshCustomerNotes();
            }
        } catch(e) {
            console.log(e);
            toast('Some Error occured!, Please check console');
        }
    }

    async updateNoteContent(updatedContent, noteId) {
        try {
            let resp = await axiosMiddleware.put(UPDATE_NOTE, {content: updatedContent, noteId: noteId, customerId: this.state.custDetail.customerId });
            if(resp.data && resp.data.STATUS == 'ERROR') {
                toast.error('Error: while saving notes');
            } else if(resp.data && resp.data.STATUS == 'EXCEPTION') {
                toast.error('Exception while updating notes');
            } else {
                toast.success('Notes has been updated Successfully');
                this.refreshCustomerNotes();
            }
        } catch(e) {
            console.log(e);
            toast('Some Error occured!, Please check console');
        }
    }

    cancelEdit(noteId) {
        let newState = {...this.state};
        newState.notes.forEach(noteObj => {
            if(noteObj.Id==noteId) noteObj.readOnly = true;
        });
        this.setState(newState);
    }

    discardNewNote() {
        this.setState({showNewPaper: false});
    }

    closeNewPaper() {
        this.setState({showNewPaper: false});
    }

    editNoteListener(noteId) {
        let newState = {...this.state};
        newState.notes.forEach(noteObj => {
            if(noteObj.Id==noteId) noteObj.readOnly = false;
            // else noteObj.readOnly = true;
        });
        this.setState(newState);
    }

    async deleteNoteListener(noteId) {
        try {
            let resp = await axiosMiddleware.patch(ARCHIVE_NOTE, {noteId: noteId, customerId: this.state.custDetail.customerId});
            if(resp.data && resp.data.STATUS == 'ERROR') {
                toast.error('Error: while saving notes');
            } else if(resp.data && resp.data.STATUS == 'EXCEPTION') {
                toast.error('Exception while archiving notes');
            } else {
                toast.success('Notes has been archived Successfully');
                this.refreshCustomerNotes();
            }
        } catch(e) {
            console.log(e);
            toast('Some Error occured!, Please check console');
        }
    }

    refreshCustomerNotes() {
        this.closeNewPaper();
        this.fetchNotesFromDB();
    }

    getRemarksByBill() {
        let theDOM = [];        
        _.each(this.state.billHistory, (aRec, index) => {
            if(aRec.Remarks) {
                theDOM .push(
                    <Row xs={12} md={12} className='bill-remark-display'>
                        <Col xs={12} md={12}><p><span>{aRec.BillNo}</span> <span className='float-right'>{convertToLocalTime(aRec.Date, {excludeTime: true})}</span></p></Col>
                        <Col xs={12} md={12}><p>{aRec.Remarks}</p></Col>
                    </Row>
                );
            }
        });
        if(theDOM.length == 0) {
            theDOM.push(
                <Row>
                    <Col xs={12} md={12} className='container-view'>
                        <h3>Not Found!</h3>
                        <h6>None of this customer bill has remarks/notes...</h6>
                    </Col>
                </Row>
            )
        }
        return theDOM;
    }

    constructNotesDom(notesArr) {
        let buffer = [];
        _.each(notesArr, (aNoteObj, index) => {
            buffer.push(
                <Row>
                    <Col xs ={12}>
                        <p> 
                            <span>
                                <FaEdit className="gs-icon" onClick={(e) => this.editNoteListener(aNoteObj.Id)}/>
                                <FaTrash className="gs-icon" onClick={(e) => this.deleteNoteListener(aNoteObj.Id)}/>
                                {/* <span className='icon edit-icon' onClick={(e) => this.onEditDetailIconClick(i)}><FontAwesomeIcon icon="edit" /></span>
                                <span className='icon' onClick={(e) => this.onDeleteDetailIconClick(i)}><FontAwesomeIcon icon="trash" /></span> */}
                            </span>
                            <span className='float-right'>
                                { convertToLocalTime(aNoteObj.CreatedDate) }
                            </span>
                        </p>
                    </Col>
                    <Col xs={12}> 
                        <NoteCard saveCb={this.updateNoteContent} discardCb={this.cancelEdit} content={aNoteObj.Notes} noteId={aNoteObj.Id} readOnly={aNoteObj.readOnly}/>

                        {/* <ReactQuill
                            value={aNoteObj.Notes}
                            readOnly={aNoteObj.readOnly}
                            // theme={"bubble"}
                            /> */}
                    </Col>
                </Row>
            );
        });
        return buffer;
    }

    getCustomRemarks() {
        if(this.state.notes && this.state.notes.length > 0) {
            return this.constructNotesDom(this.state.notes);
        } else {
            return (
                <Row>
                    <Col xs={12} md={12} className='container-view'>
                        <h3>Not Found!</h3>
                        <h6>No Customer specific notes found! Try to add some notes by clicking on '+' icon above...</h6>
                    </Col>
                </Row>
            )
        }
    }

    getNewPaper() {
        // value={''} noteId={null}
        return <NoteCard saveCb={this.saveNewNoteContent} discardCb={this.discardNewNote} isNew={true}/>
    }

    render() {
        return (
            <Container className='notes-main-container'>
                <Row>
                    <Col xs={12}>
                        <Row>
                            <h4>Customer's:</h4>
                            <input type="button" className='gs-button' value="+" onClick={this.onClickAddNoteBtn} style={{marginLeft: "30px", padding: "0px 30px"}}/> 
                        </Row>
                        {this.state.showNewPaper && this.getNewPaper()}
                        {this.getCustomRemarks()}
                    </Col>
                </Row>
                <Row style={{marginTop: '25px'}}>
                    <Col xs={12} md={12}><h4>Collected from all Bills:</h4></Col>
                    <Col xs={12} md={12}>{this.getRemarksByBill()}</Col>
                </Row>
            </Container>
        )
    }
}
export default Notes;


function NoteCard(props) {

    const [value, setValue] = useState(props.content || '');

    const saveCb = () => {
        props.saveCb(value, props.noteId);
    }

    const discardCb = () => {
        props.discardCb(props.noteId);
    }

    const onChange = (content, delta, source, editor) => {
        setValue(content);
    }

    return (
        <div>
            <ReactQuill 
                value = {value}
                readOnly = {props.readOnly}
                onChange = {(content, delta, source, editor) => onChange(content, delta, source, editor)}
            />
            {!props.readOnly && 
                <div>
                    <input type="button" value={props.isNew?"SAVE":"UPDATE"} className="gs-button" onClick={saveCb} />
                    <input type="button" value="DISCARD" className="gs-button" onClick={discardCb}/>
                </div>
            }
        </div>
    )
}

function NewNoteOld(props) {
    const { quill, quillRef } = useQuill();

    console.log(quill);    // undefined > Quill Object
    console.log(quillRef); // { current: undefined } > { current: Quill Editor Reference }
  
    useEffect(()=> {
        if (quill == null) return;
        const handler = (delta, oldDelta, source) => {
            // console.log(delta);
            // console.log(quill.getText()); // Get text only
            // console.log(quill.getContents()); // Get delta contents
            // console.log(quill.root.innerHTML); // Get innerHTML using quill
            // console.log(quillRef.current.firstChild.innerHTML); // Get innerHTML using quillRef
        }
        quill.on("text-change", handler);
        return () => {
            quill.off("text-change", handler)
        }
    }, [quill] );

    const saveNoteContent = () => {
        props.saveNoteContent(quill.root.innerHTML);
    }

    const discardNewNote = () => {
        props.discardCb();
    }

    return (
        <>
            <div className="new-quill-paper">
                <div style={{ width: `100%` , height: 100 }}>
                    <div ref={quillRef} />
                </div>
                <div style={{marginTop: '45px'}}>
                    <input type="button" value="SAVE" className="gs-button" onClick={saveNoteContent} />
                    <input type="button" value="DISCARD" className="gs-button" onClick={discardNewNote}/>
                </div>
            </div>
        </>
    );
}
