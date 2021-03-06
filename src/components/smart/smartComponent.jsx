import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { isAccountActive } from '../../actions/login.js';
import Header from '../header/header';
import Home from '../home/home';
import LoginPage from '../login/login';
import BillCreation from '../billcreate/billcreation';
import Redeem from '../redeem/redeem';
import Pledgebook from '../pledgebook/pledgebook';
import CustomerDetail from '../customerDetail/customerDetail';
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
import TallyPage from '../tally/tallyPage';
//import Products from '../products/Products';
import AddStock from '../stock/addStock/AddStock';
// import ViewStock from '../stock/viewStock/ViewStock';
import StockViewTabLayout from '../stock/viewStock/index';
import SellItem from '../stock/sellItems/SellItem';
import StockSetup from '../stock/setup/StockSetup';
import TagDemo from '../stock/tag/TagDemo';
import ActivationPage from '../activation/ActivationPage';
import FontViewerPage from '../fontViewer/FontView';
import { getStoreDetails } from '../../actions/storeDetails';
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
            if(!this.props.auth.isActivated) {
                this.props.getStoreDetails();
            }
        }
    }
    render() {        
        if(this.props.auth.isAuthenticated) {
            if(!this.props.auth.isActivated) 
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
                                <Route exact path= '/' component={ActivationPage} />
                                <Route path= '/logout' component={Logout} />
                            </div>
                        </div>
                    </Router>
                )

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
                                {/* <ReactTooltip /> */}
                                <Route exact path='/' component={Home} />
                                <Route path= '/billcreate' component={BillCreation} />
                                <Route path= '/redeem' component={Redeem} />
                                <Route path= '/pledgebook' component={Pledgebook} />
                                <Route path= '/customerdetail' component={CustomerDetail} />                                
                                <Route path= '/users' component={Users} />
                                <Route path= '/demo' component={Demo} />
                                <Route path= '/picture' component={Picture} />
                                <Route path= '/logout' component={Logout} />
                                <Route path= '/uploadpicdemo' component={UploadPicDemo} />
                                <Route path= '/loan-settings' component={LoanSetup} />
                                <Route path= '/backup_restore' component={BackupRestore} />
                                <Route path= '/tally' component={TallyPage} />
                                {/* <Route path= "/products" component={Products} /> */}
                                <Route path= "/stock-add" component={AddStock} />
                                <Route path= "/stock-view" component={StockViewTabLayout} />
                                <Route path= "/sell-item" component={SellItem} />
                                <Route path= "/stock-setup" component={StockSetup} />
                                <Route path= "/tag-demo" component={TagDemo} />
                                <Route path= "/font-view" component={FontViewerPage} />
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
                        <Route exact path= '/' component={LoginPage} />
                        <Route path= '/signup' component={SignUpPage} />
                        <Route path= '/logout' component={Logout} />
                    </div>
                </Router>
            )
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