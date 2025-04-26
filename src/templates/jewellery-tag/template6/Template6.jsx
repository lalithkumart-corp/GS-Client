import './Template6.scss';
import Barcode from "react-barcode";

const Template6 = ({
    storeName, storeNameFull, division, 
    grams, size, itemName, huid, config, productId, trackId, wsgPct, customization, displayBisLogo=true
}) => {
    config = config || {};
    let showSize = size?true:false;
    let showHuid = huid?true:false;
    let showItemName = false;
    if(!showSize && !showHuid) showItemName = true;

    grams = grams?parseFloat(grams).toFixed(3):'';

    let customCss = customization?.css || {};

    const getBarCode = () => {
        const barcodeLabelCss = {
            top: '21px'
        };
        if(customCss.topOffsetPx) {
            barcodeLabelCss.top = (parseInt(customCss.topOffsetPx) + 21 ) + 'px';
        }
        if(huid) {
            return <>
                <span className="barcode-span">
                    <Barcode 
                        value={huid}
                        width={1} 
                        fontSize={1}  //px
                        height={16.5} //px
                        displayValue={false}
                        renderer='svg'
                    />
                </span>
            </>;
        } else if(trackId) {
            return <>
                <span className="barcode-span">
                    <Barcode 
                        value={trackId}
                        width={1} 
                        fontSize={1}  //px
                        height={16.5} //px
                        displayValue={false}
                        renderer='svg'
                    />
                </span>
            </>;
        }
    };

    let panelCss = {};
    if(customCss)
        panelCss.paddingTop = customCss.topOffsetPx || 0;
    
    const hallmarkLogoSpanStyles = {
        display: displayBisLogo?'inline-block':'none',
        position: 'absolute',
        height: '11px',
        marginTop: '3px'
    }
    const hallmarkLogoStyles = {
        height: '100%',
        marginTop: '-6px'
    }
    const divisionStyles = {
        textAlign: 'center',
        paddingLeft: `${displayBisLogo?'15px':'0'}`
    }
    // const section2Part2 = {
    //     marginTop: size?'-3px':'3px',
    //     marginLeft: size?'13px':'2px'
    // }
    return (
        <>
            <div className="jewellery-tag-template-6-label" style={panelCss}>
                <div  className='label-content-section'>
                    <div className='section-1'>
                        <div className='part-1'>
                            <div className='row-1'>
                                <div>
                                    <div style={{textAlign: 'left', display: 'inline-block', width: '34px', fontSize: '13px'}}>
                                        {storeName}
                                    </div>
                                    <div style={{textAlign: 'right', display: 'inline-block', width: '54px', fontSize: '13px'}}>
                                        {size && `${size}`}
                                    </div>
                                </div>
                            </div>
                            <div className='row-2' style={{letterSpacing: '2px'}}>
                                <span style={{lineHeight: '14px'}}>
                                    <span style={{fontSize: '11px'}}>Wt</span>
                                    <span style={{fontWeight: 'normal'}}>:</span>
                                    <span style={{fontSize: '15px'}}>{grams}</span>
                                </span>
                            </div>
                        </div>
                        
                    </div>
                    <div className='section-2'>
                        <div className="part-1">
                            <div className='row-1' style={{lineHeight: '16px'}}>
                                <span style={{fontWeight: 800}}>{itemName}</span>
                            </div>    
                            <div className='row-2' style={{letterSpacing: '2px'}}>
                                <span style={{lineHeight: '14px'}}>
                                    <span style={{fontSize: '11px'}}>Wt</span>
                                    <span style={{fontWeight: 'normal'}}>:</span>
                                    <span style={{fontSize: '15px'}}>{grams}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Template6;
