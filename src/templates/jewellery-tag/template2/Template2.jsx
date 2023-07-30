import './Template2.scss';

const Template2 = ({
    storeName, division, 
    grams, size, itemName, huid, config
}) => {
    config = config || {};
    let showSize = size?true:false;
    let showHuid = huid?true:false;
    let showItemName = false;
    if(!showSize && !showHuid) showItemName = true;

    grams = grams?parseFloat(grams).toFixed(3):'';

    const storeNameStyles = {
        width: '25px',
        fontSize: 20,
        fontWeight: 'bold'
    };
    const itemDivStyles = {
        textAlign: 'center',
        width: '57px',
        fontSize: '17px',
        fontWeight: 'bold'
    };
    const hallmarkLogoSpanStyles = {
        height: '16px',
        display: config.showBis?'inline-block':'none',
        position: 'absolute',
        marginLeft: '-10px',
        marginTop: '4px'
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

    return (
        <>
            <div className="jewellery-tag-template-2-label">
                <div  className='label-content-section'>
                    <div className='section-1' style={{paddingLeft: '3mm'}}>
                        <div className='row-1'>
                            <span className='store-name-abbr' style={storeNameStyles}>{storeName}</span>
                            <span className='item-division' style={itemDivStyles}>{division}</span>
                            <span className='hallmark-logo-span' style={hallmarkLogoSpanStyles}>
                                <img className='hallmark-logo' style={hallmarkLogoStyles} src='/images/bis.jpg' />
                            </span>
                        </div>
                        <div className='row-2'>
                            <span style={{fontWeight: 'bold'}}>
                                <span style={weightLabelStyles}>wt: </span>
                                <span style={weightValueStyles}>{grams}</span>
                            </span>
                        </div>
                    </div>
                    <div className='section-2'>
                        <div className='row-1'>
                            <span style={itemSizeStyles}>{showSize?`s${size}`:''}</span>
                            <span style={itemNameStyles}>{showItemName?itemName:''}</span>
                            <span style={huidStyles}>{showHuid?huid:''}</span>
                        </div>
                        <div className='row-2'>
                            <span style={{fontWeight: 'bold', paddingLeft: '3px'}}>
                                <span style={weightLabelStyles}>wt: </span>
                                <span style={weightValueStyles}>{grams}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Template2;
