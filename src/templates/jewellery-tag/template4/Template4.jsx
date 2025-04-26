import './Template4.scss';
import Barcode from "react-barcode";

const Template4 = ({
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
    const section2Part2 = {
        marginTop: size?'-3px':'3px',
        marginLeft: size?'11px':'0'
    }
    return (
        <>
            <div className="jewellery-tag-template-4-label" style={panelCss}>
                <div  className='label-content-section'>
                    <div className='section-1'>
                        <div className='part-1'>
                            <div className='division-label-div'>
                                <span className='hallmark-logo-span' style={hallmarkLogoSpanStyles}>
                                    <img className='hallmark-logo' style={hallmarkLogoStyles} src='/images/bis.jpg' />
                                </span>
                                <span style={divisionStyles}>
                                    {division}
                                </span>
                            </div>
                        </div>
                        <div className='part-2'>
                            <div className='row-1'>
                                <div className='barcode-div'>
                                    {getBarCode()}
                                </div>
                            </div>
                            <div className='row-2'>
                                {storeNameFull}
                            </div>
                        </div>
                        
                    </div>
                    <div className='section-2'>
                        <div className="part-1">
                            {size && `S- ${size}`}
                        </div>
                        
                        <div className="part-2" style={section2Part2}>
                            <div className='row-1'>
                                <div style={{lineHeight: '14px', textTransform: 'uppercase', fontWeight: 800}}>{itemName}</div>
                            </div>    
                            <div className='row-2'>
                                <span style={{lineHeight: '16px'}}>
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

export default Template4;
