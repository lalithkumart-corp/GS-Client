import './Template2.scss';
import Barcode from "react-barcode";

const Template2 = ({
    storeName, division, 
    grams, size, itemName, huid, config, productId, trackId, wsgPct, customization
}) => {
    config = config || {};
    let showSize = size?true:false;
    let showHuid = huid?true:false;
    let showItemName = false;
    if(!showSize && !showHuid) showItemName = true;

    grams = grams?parseFloat(grams).toFixed(3):'';

    let customCss = customization?.css || {};

    const getBarCode = () => {
        const productIdCss = {
            top: '21px'
        };
        if(customCss.topOffsetPx) {
            productIdCss.top = (parseInt(customCss.topOffsetPx) + 21 ) + 'px';
        }
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
                <span className="product-id" style={productIdCss}>{productId}</span>
            </span>
        </>;
    };

    let panelCss = {};
    if(customCss)
        panelCss.paddingTop = customCss.topOffsetPx || 0;
    
    return (
        <>
            <div className="jewellery-tag-template-2-label" style={panelCss}>
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
