export const template1 = {
    gstNumber: '33EUAPS4639K1Z9',
    itemType: 'gold',
    storeName: 'MALAKSHMI JEWELLERS',

    hsCode: 7113,
    billNo: 'A: 1',
    dateVal: '23-09-2021',
    address: '2/34 POONAMALLE HIGH ROAD',
    place: 'KATTUPAKKAM',
    city: 'CHENNAI',
    pinCode: '600056',
    customerName: 'Raj Kumar',
    pricePerGm: 4387,
    ornaments: [
        {
            title: 'Gold White Stone Ring',
            quanity: 1,
            grossWt: 1.078,
            netWt: 0.980,
            amount: 4730,
            wastagePercent: 0,
            wastageVal: 0,
        }
    ],
    calculations: {
        totalMakingCharge: 125,
        // cgst: 1.5,
        // sgst: 1.5,
        totalCgstVal: 72.825,
        totalSgstVal: 72.825,
        grandTotal: 5000.65
    }
};
export const template2 = {
    gstNumber: '33EUAPS4639K1Z9',
    itemType: 'gold',
    storeName: 'MALAKSHMI JEWELLERS',
    address: '2/34 POONAMALLE HIGH ROAD',
    place: 'KATTUPAKKAM',
    city: 'CHENNAI',
    pinCode: '600056',
    storeMobile1: '9841458015',
    storeMobile2: '9566142103',

    headerLeftLogo: {
        src: '',
        styles: {

        }
    },
    headerRightLogo: {
        src: '',
        styles: {

        }
    },
    hsCode: 7113,
    billNo: 'A: 1',
    dateVal: '23-09-2021',
    customerName: 'Raj Kumar',
    customerMobile: '8907766776',
    goldRatePerGm: 4387,
    silverRatePerGm: 70,
    ornaments: [
        {
            title: 'Gold Kamal Ring',
            quanity: 2,
            grossWt: 4.200,
            netWt: 4.200,
            amount: 20267.94,
            wastagePercent: 10,
            wastageVal: 0.42,
            pricePerGm: 4387,
            division: '916KDM',
            discount: 167,
            netAmount: 20167.94
        },
        {
            title: 'Gold White Stone Ring',
            quanity: 1,
            grossWt: 1.078,
            netWt: 1.078,
            amount: 5438.57,
            wastagePercent: 15,
            wastageVal: 0.1617,
            pricePerGm: 4387,
            division: '916KDM',
            discount: 38,
            netAmount: 5400.57
        }
    ],
    oldOrnaments: {
        grossWt: 2.00,
        lessWt: 0.200,
        netWt: 1.800,
        pricePerGram: 4287,
        netAmount: 7716.6
    },
    calculations: {
        totalMakingCharge: 125,
        // cgst: 1.5,
        // sgst: 1.5,
        totalInitialPrice: 25568.51,
        totalCgstVal: 72.825,
        totalSgstVal: 72.825,
        totalDiscount: 205,
        oldNetAmt: 7716.6,
        grandTotal: 17997,
    },
    payments: {
        card: 1000,
        cash: 4000
    }
};

export const template3 = {
	"gstNumber": "112a",
	"storeName": "MAHALAKSHMI JEWELLERS",
	"address": "2/34 MAIN ROAD",
	"place": "KATTUPAKKAM",
	"city": "CHENNAI",
	"pinCode": "600056",
	"storeMobile1": "8148588004",
	"storeMobile2": "",
	"hsCode": 7113,
	"goldRatePerGm": "4622",
	"silverRatePerGm": "70",
	"billNo": "A: 1",
	"customerName": "DANIEPHILP",
	"customerMobile": "8148616456",
	"dateVal": "23-09-2021",
	"ornaments": [{
		"title": "Ring",
		"qty": 1,
		"grossWt": 2.07,
		"netWt": 2.07,
		"division": "916",
		"wastagePercent": 10,
		"pricePerGm": 4622,
		"wastageVal": 0.207,
		"makingCharge": 100,
		"priceOfOrn": 10624.294,
		"cgstPercent": 1.5,
		"cgstVal": 159.36,
		"sgstPercent": 1.5,
		"sgstVal": 159.36,
		"discount": 943.014,
		"amountWithTax": 10943.01,
		"amountWithTaxAndDiscount": 10000
	}],
	"oldOrnaments": {
		"itemType": "G",
		"grossWt": 1,
		"lessWt": 0.15,
		"netWt": 1,
		"pricePerGram": 4522,
		"netAmount": 3843.7
	},
	"calculations": {
		"totalMakingCharge": 100,
		"totalInitialPrice": 10624.294,
		"cgstAvgPercent": 1.5,
		"sgstAvgPercent": 1.5,
		"totalCgstVal": 159.36,
		"totalSgstVal": 159.36,
		"totalNetAmountWithTax": 10943.014000000001,
		"totalDiscount": 943.014,
		"totalPurchasePrice": 10000,
		"oldNetAmt": 3843.7,
		"grandTotal": 6156.3
	}
};
