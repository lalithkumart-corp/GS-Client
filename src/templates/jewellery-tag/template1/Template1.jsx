import './Template1.scss';

const Template1 = ({
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
        width: '45px',
        fontSize: 20,
        fontWeight: 'bold'
    };
    const itemDivStyles = {
        textAlign: 'center',
        width: '70px',
        fontSize: '17px',
        fontWeight: 'bold'
    };
    const hallmarkLogoSpanStyles = {
        height: '19px',
        width: '24px',
        display: config.showBis?'inline-block':'none'
    };
    const hallmarkLogoStyles = {
        height: '100%',
        marginTop: '-6px'
    };
    const weightStyles = {
        fontSize: '22px',
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
        fontSize: '17px'
    };
    const itemSizeStyles = {
        width: '34px',
        fontSize: '16px',
        fontWeight: 'bold',
        display: showSize?'inline-block':'none'
    };

    return (
        <>
            <div className="jewellery-tag-template-2-label">
                <div  className='label-content-section'>
                    <div className='section-1'>
                        <div className='row-1'>
                            <span className='store-name-abbr' style={storeNameStyles}>{storeName}</span>
                            <span className='item-division' style={itemDivStyles}>{division}</span>
                            <span className='hallmark-logo-span' style={hallmarkLogoSpanStyles}>
                                <img className='hallmark-logo' style={hallmarkLogoStyles} src='/images/bis.jpg' />
                            </span>
                        </div>
                        <div className='row-2'>
                            <span style={{fontWeight: 'bold'}}>
                                <span style={{fontSize: '22px'}}>wt: </span>
                                <span style={weightStyles}>{grams}</span>
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
                                <span style={{fontSize: '22px'}}>wt: </span>
                                <span style={weightStyles}>{grams}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Template1;
