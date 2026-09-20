import './Template7.scss';
import Barcode from 'react-barcode';

const Template7 = ({
    storeName,
    storeNameFull,
    division,
    grams,
    size,
    itemName,
    huid,
    config,
    productId,
    trackId,
    wsgPct,
    customization,
    displayBisLogo = true,
    amount,
    supplierId,
}) => {
    const barcodeValue = trackId || huid || '';
    const normalizedGrams = grams !== undefined && grams !== null && grams !== '' ? parseFloat(grams).toFixed(3) : '';
    const formattedAmount = amount !== undefined && amount !== null && amount !== '' ? amount : '';
    const firstRowLeftText = `${storeName}${supplierId ? `- ${supplierId}` : ''}`;
    const firstRowRightText = size ? size : '';
    const thirdRowLeftValue = huid || itemName || trackId || '';
    const thirdRowRightValue = '';
    const secondPartThirdRowLeft = division || (formattedAmount ? `₹:${formattedAmount}` : '');
    const secondPartThirdRowRight = wsgPct || '';

    const renderBarcode = (value) => {
        if (!value) return null;

        return (
            <span className="barcode-span">
                <Barcode
                    value={value}
                    width={0.6}
                    fontSize={1}
                    height={16.5}
                    margin={0}
                    displayValue={false}
                    renderer='svg'
                />
            </span>
        );
    };

    return (
        <div className="jewellery-tag-template-7-label">
            <div className="label-content-section">
                <div className="tag-body">
                    <div className="body-part body-part-1">
                        <div className="row row-1">
                            <span className="row-left">{firstRowLeftText}</span>
                            <span className="row-right">{firstRowRightText}</span>
                        </div>
                        <div className="row row-2">{renderBarcode(barcodeValue)}</div>
                        <div className="row row-3">
                            <span className="row-left">{thirdRowLeftValue}</span>
                        </div>
                    </div>

                    <div className="body-part body-part-2">
                        <div className="row row-1">{barcodeValue}</div>
                        <div className="row row-2">{normalizedGrams ? `W.t: ${normalizedGrams}` : 'wt-'}</div>
                        <div className="row row-3">
                            <span className="row-left">{secondPartThirdRowLeft}</span>
                            <span className="row-right">{secondPartThirdRowRight}</span>
                        </div>
                    </div>
                </div>

                <div className="tag-tail" aria-hidden="true" />
            </div>
        </div>
    );
};

export default Template7;
