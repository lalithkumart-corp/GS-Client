import React, { Component } from 'react';
import { useNavigate } from "react-router-dom";
import './home.scss';
import { GiReceiveMoney } from 'react-icons/gi';
import { TbReportMoney } from 'react-icons/tb';
import { BsTable  } from 'react-icons/bs';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { RiStackLine } from 'react-icons/ri';
import { MdOutlineLibraryAdd } from 'react-icons/md';
class HomeClass extends Component {
    	constructor(props) {
            super(props);
        }
        onClickIcons(identifier) {
            this.props.navigate(`/${identifier}`);
        }
        render() {
            return (
                <div className='home-page'>
                    <div className="shortcut-section">
                        <div className="an-icon" onClick={(e)=>this.onClickIcons('billcreate')}><TbReportMoney /></div>
                        <div className="an-icon" onClick={(e)=>this.onClickIcons('redeem')}><GiReceiveMoney /></div>
                        <div className="an-icon" onClick={(e)=>this.onClickIcons('pledgebook')}><BsTable /></div>
                        <br></br>
                        <div className="an-icon" onClick={(e)=>this.onClickIcons('stock-add')}><MdOutlineLibraryAdd /></div>
                        <div className="an-icon" onClick={(e)=>this.onClickIcons('stock-view')}><RiStackLine /></div>
                        <div className="an-icon" onClick={(e)=>this.onClickIcons('sell-item')}><FaFileInvoiceDollar /></div>


                    </div>
                    <div style={{textAlign: "center"}}>
                        <img src="/images/logo.png" className="home-image"/>
                    </div>
                </div>
            )
        }
}


const Home = props => {
    const navigate = useNavigate();
  
    return <HomeClass navigate={navigate} {...props} />
}
export default Home;
