import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { isAccountActive } from '../../actions/login.js';
import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import BillCreation from '../billcreate/billcreation.jsx';
import Redeem from '../redeem/redeem';
import Pledgebook from '../pledgebook/pledgebook';
import CustomerPortal from '../customerPortal/customersPortal';
import Demo from '../demo/demo';
import Picture from '../profilePic/ProfilePic';
import UploadPicDemo from '../profilePic/uploadPic';
import Logout from '../logout/logout';
import Navbar from '../navbar/navbar';
import RightSideBar from '../rightSideBar/RightSideBar';
import { ToastContainer } from 'react-toastify';
// import ReactTooltip from 'react-tooltip';
// import tooltip from 'tooltip';
import 'react-toastify/dist/ReactToastify.css';
import history from '../../history';
import Users from '../users/users.jsx';
import './smartComponent.css';
import SignUpPage from '../signup/signup';
import LoanSetup from '../loan-setup/setup';
import BackupRestore from '../backup_restore/backupRestore';
import CashManager from '../tally/cashManager/cashManager';
import TallyPage from '../tally/tallyPage';
//import Products from '../products/Products';
import AddStock from '../stock/addStock/AddStock';
// import ViewStock from '../stock/viewStock/ViewStock';
import StockViewTabLayout from '../stock/viewStock/index';
import SellItem from '../stock/sellItems/SellItem';
import JewelleryCustomerInvoicesList from '../stock/custInvoices/custInvoicesList';
import StockSetup from '../stock/setup/StockSetup';
import TagSetup from '../jewellery/tag/TagSetup.jsx';
import TagDemo from '../stock/tag/TagDemo';
import CustomTag from '../stock/tag/CustomTag';
import ActivationPage from '../activation/ActivationPage';
import FontViewerPage from '../fontViewer/FontView';
import { getStoreDetails } from '../../actions/storeDetails';
import CustomLabel from '../stock/tag/CustomLabel';
import Settings from '../settings/settings';
import MyContacts from '../mycontacts/MyContactManager';
// import Udhaar from '../udhaar/Udhaar';
import UdhaarEntry from '../udhaar/UdhaarEntry';
import UdhaarListComp from '../udhaar/UdhaarList';
import ResetPassword from '../passwordReset/passwordReset';
import GstBillingDemo from '../jewellery/billing/gstbillingDemo';
import Tools from '../tools';
import {LAL_M_AD_129} from '../../core/sitemap';
import { saveLocation } from '../../utilities/apiUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-tippy/dist/tippy.css'
// var config  = {
//     showDelay: 0,
//     style: {
//       padding: 5
//     }
// }
// tooltip(config);
class SmartComponent extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {        
        this.props.isAccountActive();
    }
    componentDidMount() {
        if(this.props.auth.isAuthenticated) {
            if(this.props.auth.isActivated)
                this.props.getStoreDetails();
            
            navigator.geolocation.getCurrentPosition((position) => {
                saveLocation(position.coords.latitude, position.coords.longitude);
            }, (error) => {
                console.log(error);
            }, {timeout:10000});
        }
        
        // window.addEventListener('online',  updateOnlineStatus);
        // window.addEventListener('offline', updateOnlineStatus);

        // function updateOnlineStatus(event) {
        //     // var condition = navigator.onLine ? "online" : "offline";
        //     if(navigator.onLine)
        //         saveLocation(position.coords.latitude, position.coords.longitude);
        // }
    }
    componentWillReceiveProps(nextprops) {
        if((nextprops.auth.isAuthenticated !== this.props.auth.isAuthenticated) || (nextprops.auth.isActivated !== this.props.auth.isActivated)) {
            if(nextprops.auth.isActivated)
                this.props.getStoreDetails();
        }
    }
    render() {
        var yy = LAL_M_AD_129;
        yy = yy.replaceAll('GS_', '');
        yy = yy.replaceAll('MAK_', '');
        yy = yy.replaceAll('INTER', '');
        if(true) {// yy == "-1844838684" // temporarily making as tru for development mode
            if(this.props.auth.isAuthenticated) {
                if(!this.props.auth.isActivated) {
                    return (
                        <Router history={history}>
                            <div>
                                <header>
                                    {/* <Header /> */}
                                </header>
                                <div className='navbar-container'>
                                    <Navbar />
                                </div>
                                <div className='page-content'>
                                    <ToastContainer position={'top-center'} hideProgressBar={false}/>
                                    <Routes>
                                    <Route exact path= '/' Component={ActivationPage} />
                                    {/* <Route path= '/signup' Component={SignUpPage} /> */}
                                    <Route path= '/logout' Component={Logout} />
                                    </Routes>
                                </div>
                            </div>
                        </Router>
                    )
                }
                return (
                    <Router history={history}>
                            <div>
                                <header>
                                    {/* <Header /> */}
                                </header>
                                <div className='navbar-container'>
                                    <Navbar />
                                </div>
                                <div className='page-content'>
                                    <ToastContainer position={'top-center'} hideProgressBar={false}/>
                                    <Routes>
                                    {/* <ReactTooltip /> */}
                                    <Route exact path='/' Component={Home} />
                                    <Route path= '/billcreate' Component={BillCreation} />
                                    <Route path= '/redeem' Component={Redeem} />
                                    <Route path= '/pledgebook' Component={Pledgebook} />
                                    <Route path= '/customer-portal' Component={CustomerPortal} />                                
                                    <Route path= '/users' Component={Users} />
                                    <Route path= '/demo' Component={Demo} />
                                    <Route path= '/picture' Component={Picture} />
                                    <Route path= '/logout' Component={Logout} />
                                    <Route path= '/uploadpicdemo' Component={UploadPicDemo} />
                                    <Route path= '/loan-settings' Component={LoanSetup} />
                                    <Route path= '/backup_restore' Component={BackupRestore} />
                                    <Route path= '/cash-manager' Component={CashManager} />
                                    <Route path= '/tally' Component={TallyPage} />
                                    {/* <Route path= "/products" Component={Products} /> */}
                                    <Route path= "/stock-add" Component={AddStock} />
                                    <Route path= "/stock-view" Component={StockViewTabLayout} />
                                    <Route path= "/sell-item" Component={SellItem} />
                                    <Route path= "/jewellery-cust-invoices" Component={JewelleryCustomerInvoicesList} />
                                    <Route path= "/stock-setup" Component={StockSetup} />
                                    <Route path="/tag-setup" Component={TagSetup} />
                                    <Route path= "/tag-demo" Component={TagDemo} />
                                    <Route path="/tag-v2" Component={CustomTag} />
                                    <Route path="/label-generator" Component={CustomLabel} />
                                    <Route path= "/font-view" Component={FontViewerPage} />
                                    <Route path="/settings" Component={Settings} />
                                    <Route path= "/contact-manager" Component={MyContacts} />
                                    <Route path="/udhaar-create" Component={UdhaarEntry} />
                                    <Route path="/udhaar-list" Component={UdhaarListComp} />
                                    <Route path="/reset-pwd" Component={ResetPassword} />
                                    <Route path="/gst-bill-generator" Component={GstBillingDemo} />
                                    <Route path="/tools" Component={Tools} />
                                    </Routes>
                                </div>
                                {/* <div className="floating-right-side-bar"> */}
                                <div className={`floating-right-side-bar ${this.props.rightSideBar.visibility?'show':'hide'} `}>
                                    <RightSideBar />
                                </div>
                            </div>
                    </Router>
                )
            } else {
                return (
                    <Router history={history}>
                        <div>
                            <ToastContainer position={'top-center'} hideProgressBar={false}/>
                            <Routes>
                                <Route exact path= '/' Component={LoginPage} />
                                {/* <Route path= '/signup' Component={SignUpPage} /> */}
                                <Route path= '/logout' Component={Logout} />
                            </Routes>
                        </div>
                    </Router>
                )
            }
        } else {
            return <div></div>
        }
    }
}

const mapStateToProps = (state) => {     
    return {        
        auth: state.auth,
        rightSideBar: state.rightSideBar
    };
};

export default connect(mapStateToProps, {isAccountActive, getStoreDetails})(SmartComponent);