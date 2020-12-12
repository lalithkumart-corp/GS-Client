import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
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
import { ToastContainer } from 'react-toastify';
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
import ViewStock from '../stock/viewStock/ViewStock';
import SellItem from '../stock/sellItems/SellItem';
import StockSetup from '../stock/setup/StockSetup';
import TagDemo from '../stock/tag/TagDemo';
import FontViewerPage from '../fontViewer/FontView';
import 'bootstrap/dist/css/bootstrap.min.css';

class SmartComponent extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {

    }
    render() {        
        if(this.props.auth.isAuthenticated) {
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
                                <Route path= "/stock-view" component={ViewStock} />
                                <Route path= "/sell-item" component={SellItem} />
                                <Route path= "/stock-setup" component={StockSetup} />
                                <Route path= "/tag-demo" component={TagDemo} />
                                <Route path= "/font-view" component={FontViewerPage} />
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
        auth: state.auth
    };
};

export default connect(mapStateToProps)(SmartComponent);