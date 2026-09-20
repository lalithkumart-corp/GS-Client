import {useState, useEffect} from 'react';
import { Row, Col, Form, InputGroup, FormControl } from 'react-bootstrap';
import axiosMiddleware from '../../core/axios';
import {RESET_PWD} from '../../core/sitemap';
import { toast } from 'react-toastify';
import history from '../../history';

function PasswordReset() {
    
    let [currentPwd, setCurrentPwdObj] = useState({error: false, value: ''});
    let [newPwd, setNewPwdObj] = useState({error: false, value: ''});
    let [confirmNewPwd, setConfirmNewPwdObj] = useState({error: false, value: ''});

    let onChange = (val, identifier) => {
        if(identifier == 'current')
            setCurrentPwdObj({...currentPwd, value: val});
        else if(identifier == 'new')
            setNewPwdObj({...newPwd, value: val});
        else if(identifier == 'confirm-new')
            setConfirmNewPwdObj({...confirmNewPwd, value: val});
    }

    let validate = () => {
        let flag = true;
        let msg = '';
        if(currentPwd.value && newPwd.value && confirmNewPwd.value) {
            if(newPwd.value != confirmNewPwd.value) {
                setConfirmNewPwdObj({...confirmNewPwd, error: true});
                setNewPwdObj({...newPwd, error: true});
                flag = false;
                msg = 'New Password and Confirm-New password does not match';
            }
        } else {
            flag = false;
            msg = "Input value is null";
        }
        if(flag) {
            setConfirmNewPwdObj({...confirmNewPwd, error: false});
            setNewPwdObj({...newPwd, error: false});
            setConfirmNewPwdObj({...confirmNewPwd, error: false});
        }
        return {flag, msg};
    }

    let onClickSubmitBtn = () => {
        let validationRes = validate();
        if(validationRes.flag)
            triggerApi();
        else
            toast.error(`${validationRes.msg || 'Please check your inputs'}`);
    }

    let triggerApi = async () => {
        try {
            let resp = await axiosMiddleware.post(RESET_PWD, {currentPassword: currentPwd.value, newPassword: confirmNewPwd.value});
            if(resp && resp.data && resp.data.STATUS=="SUCCESS") {
                toast.success('Password Updated Successfully. Logout and Login with new password');
                history.push('/logout');
            }
        } catch(e) {
            console.log(e);
        }
    }

    return (
        <div style={{width: '300px', margin: '0 auto'}}>
            <Row>
                <Col xs={12} md={12}>
                    <Form.Group
                        validationState= {currentPwd.error ? "error" :null}
                        >
                        <Form.Label>Current Password</Form.Label>
                        <InputGroup>
                            <FormControl
                                type="text"
                                value={currentPwd.value}
                                placeholder=""
                                className="current-pwd-value"
                                onChange={(e) => onChange(e.target.value, "current")}
                            />
                            <FormControl.Feedback />
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={12}>
                    <Form.Group
                        validationState= {newPwd.error ? "error" :null}
                        >
                        <Form.Label>New Password</Form.Label>
                        <InputGroup>
                            <FormControl
                                type="text"
                                value={newPwd.value}
                                placeholder=""
                                className="new-pwd-value"
                                onChange={(e) => onChange(e.target.value, "new")}
                            />
                            <FormControl.Feedback />
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={12}>
                    <Form.Group
                        validationState= {confirmNewPwd.error ? "error" :null}
                        >
                        <Form.Label>New Password Again</Form.Label>
                        <InputGroup>
                            <FormControl
                                type="text"
                                value={confirmNewPwd.value}
                                placeholder=""
                                className="confirm-new-pwd-value"
                                onChange={(e) => onChange(e.target.value, "confirm-new")}
                            />
                            <FormControl.Feedback />
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <input type="button" className="gs-button bordered" value="SUBMIT" onClick={onClickSubmitBtn} />
                </Col>
            </Row>
        </div>
    )
}

export default PasswordReset;