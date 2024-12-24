import './Template2.scss';
import Barcode from "react-barcode";

const Template2 = ({
    storeName, division, 
    grams, size, itemName, huid, config, productId, trackId, wsgPct
}) => {
    config = config || {};
    let showSize = size?true:false;
    let showHuid = huid?true:false;
    let showItemName = false;
    if(!showSize && !showHuid) showItemName = true;

    grams = grams?parseFloat(grams).toFixed(3):'';

    const storeNameStyles = {
        width: '25px',
        fontSize: 15,
        fontWeight: 'bold'
    };
    const itemDivStyles = {
        textAlign: 'center',
        width: '57px',
        fontSize: '14px',
        fontWeight: 'bold'
    };
    const hallmarkLogoSpanStyles = {
        height: '11px',
        display: config.showBis?'inline-block':'none',
        position: 'absolute',
        marginLeft: '-4px',
        marginTop: '3px'
    };
    const hallmarkLogoStyles = {
        height: '100%',
        marginTop: '-6px'
    };
    const weightLabelStyles = {
        fontSize: '14px'
    }
    const weightValueStyles = {
        fontSize: '15px',
        fontWeight: 'bold'
    };
    const itemNameStyles = {
        fontSize: '17px',
        fontWeight: 'normal',
        width: '35px',
        display: showItemName?'inline-block': 'none',
    };
    const huidStyles = {
        display: showHuid?'inline-block':'none',
        fontWeight: 'bold',
        fontSize: '14px',
        width: '60px'
    };
    const itemSizeStyles = {
        width: '31px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: showSize?'inline-block':'none'
    };

    const getBarCode = () => {
        return <>
            <span className="barcode-span">
                <Barcode 
                    value={productId} 
                    width={1} 
                    fontSize={1}  //px
                    height={16.5} //px
                    displayValue={false}
                    renderer='svg'
                    // background='lightgray'
                    // format='CODE128'
                />
                <span className="product-id">{productId}</span>
            </span>
        </>;
    };

    return (
        <>
            <div className="jewellery-tag-template-2-label">
                <div  className='label-content-section'>
                    <div className='section-1'>
                        <div className='row-1'>
                            <div className='track-id-div'>
                                {trackId}
                            </div>
                            <div className='barcode-div'>
                                {getBarCode()}
                            </div>
                            <div className='wsg-div' style={{visibility: wsgPct?'visible':'hidden'}}>
                                VA <br></br>
                                {wsgPct}% 
                            </div>
                        </div>
                        <div className='row-2' style={{visibility: huid?'visible':'hidden'}}>
                            HUID: {huid}
                        </div>
                    </div>
                    <div className='section-2'>
                        <div className='row-1'>
                            <div style={{textTransform: 'uppercase'}}>{itemName}</div>
                            <div style={{paddingTop: '3px'}}>G.Wt: {grams}</div>
                        </div>
                        <div className='row-2'>
                            N.Wt: {grams}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Template2;
