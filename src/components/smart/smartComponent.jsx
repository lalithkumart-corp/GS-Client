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
import GirviAnalytics from '../girviAnalytics';
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
        if(true || yy == "-236375844") {// yy == "-1844838684" // temporarily making as tru for development mode
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
                                    <Route exact path= '/' element={<ActivationPage />} />
                                    {/* <Route path= '/signup' element={<SignUpPage />} /> */}
                                    <Route path= '/logout' element={<Logout />} />
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
                                    <Route exact path='/' element={<Home />} />
                                    <Route path= '/billcreate' element={<BillCreation />} />
                                    <Route path= '/redeem' element={<Redeem />} />
                                    <Route path= '/pledgebook' element={<Pledgebook />} />
                                    <Route path= '/customer-portal' element={<CustomerPortal />} />                                
                                    <Route path= '/users' element={<Users />} />
                                    <Route path= '/demo' element={<Demo />} />
                                    <Route path= '/picture' element={<Picture />} />
                                    <Route path= '/logout' element={<Logout />} />
                                    <Route path= '/uploadpicdemo' element={<UploadPicDemo />} />
                                    <Route path= '/loan-settings' element={<LoanSetup />} />
                                    <Route path= '/backup_restore' element={<BackupRestore />} />
                                    <Route path= '/cash-manager' element={<CashManager />} />
                                    <Route path= '/tally' element={<TallyPage />} />
                                    {/* <Route path= "/products" element={<Products />} /> */}
                                    <Route path= "/stock-add" element={<AddStock />} />
                                    <Route path= "/stock-view" element={<StockViewTabLayout />} />
                                    <Route path= "/sell-item" element={<SellItem />} />
                                    <Route path= "/jewellery-cust-invoices" element={<JewelleryCustomerInvoicesList />} />
                                    <Route path= "/stock-setup" element={<StockSetup />} />
                                    {/* <Route path="/tag-setup" element={<TagSetup />} /> */}
                                    <Route path= "/tag-demo" element={<TagDemo />} />
                                    <Route path="/tag-v2" element={<CustomTag />} />
                                    <Route path="/label-generator" element={<CustomLabel />} />
                                    <Route path= "/font-view" element={<FontViewerPage />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path= "/contact-manager" element={<MyContacts />} />
                                    <Route path="/udhaar-create" element={<UdhaarEntry />} />
                                    <Route path="/udhaar-list" element={<UdhaarListComp />} />
                                    <Route path="/reset-pwd" element={<ResetPassword />} />
                                    <Route path="/gst-bill-generator" element={<GstBillingDemo />} />
                                    <Route path="/tools" element={<Tools />} />
                                    <Route path="/girvi-analytics" element={<GirviAnalytics />} />
                                    <Route path= "/license" element={<ActivationPage />} />
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
                                <Route exact path= '/' element={<LoginPage />} />
                                {/* <Route path= '/signup' element={<SignUpPage />} /> */}
                                <Route path= '/logout' element={<Logout />} />
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