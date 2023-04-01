
const Template2 = ({
    storeName, touch, showBis, 
    grams, size, itemName
}) => {
    const storeNameStyles = {
        width: '45px',
        fontSize: 20,
        fontWeight: 'bold'
    };
    const touchStyles = {
        fontSize: '17px',
        fontWeight: 'bold'
    };
    const imgStyles = {
        display: showBis?'inline':'none',
        position: 'absolute',
        height: '20px'
    };
    const weightStyles = {
        fontSize: '22px',
        fontWeight: 'bold'
    };
    const itemNameStyles = {
        fontSize: '17px',
        fontWeight: 'normal',
        width: '35px'
    };
    const itemSizeStyles = {
        width: '34px',
        fontSize: '16px',
        fontWeight: 'bold'
    };

debugger;
    return (
        <div style={{height: '60px', width: '425px', paddingLeft: '15px', fontFamily: 'monospace'}}>
            <div style={{width: '302px', display: "inline-block", height: '65px', backgroundColor: 'lightgray', paddingTop: '6px'}}>
                <div style={{width: '150px', display: "inline-block"}}>
                    <div style={{height: '20px', paddingLeft: '4px'}}>
                        <span style={storeNameStyles}>{storeName}</span>
                        <span style={touchStyles}>{touch}</span>
                        <span style={{marginLeft: '58px', height: '12px'}}><img style={imgStyles} src='/images/bis.jpg' /></span>
                    </div>
                    <div style={{height: '30px', paddingLeft: '4px'}}>
                        <span style={{fontWeight: 'bold'}}>
                            <span style={{fontSize: '22px'}}>wt: </span>
                            <span style={weightStyles}>{grams}</span>
                        </span>
                    </div>
                </div>
                <div style={{width: '150px', display: "inline-block", height: '50px'}}>
                    <div style={{height: '20px', fontSize: '16px'}}>
                        {/* <span style={mcDivStyles}>
                            <span style={mcLabelStyles}>{this.props.form.mc.label}</span>
                            <span style={mcStyles}>{this.props.makingCharge}</span>
                        </span> */}
                        <span style={itemSizeStyles}>{size}</span>
                        <span style={itemNameStyles}>{itemName}</span>
                    </div>
                    <div style={{height: '30px'}}>
                        <span style={{fontWeight: 'bold', paddingLeft: '3px'}}>
                            <span style={{fontSize: '22px'}}>wt: </span>
                            <span style={weightStyles}>{grams}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Template2;
