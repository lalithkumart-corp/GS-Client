import React, {Component} from 'react';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
let label;

class GsDateRangePicker extends Component {
    constructor(props) {
        super(props);
        let dates = this.getDateProps();
        this.state = {
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'This Year': [moment().startOf('year'), moment().endOf('year')],
                'Last 2 Years': [moment().subtract(1, 'year').startOf('year'), moment().endOf('year')],
                'Last 3 Years': [moment().subtract(2, 'year').startOf('year'), moment().endOf('year')],
                'Last 4 Years': [moment().subtract(3, 'year').startOf('year'), moment().endOf('year')],
                'Last 5 Years': [moment().subtract(4, 'year').startOf('year'), moment().endOf('year')]
            },
            startDate: dates.startDate,
            endDate: dates.endDate,
            canShowCalendarIcon: this.getIconOptionFromProps()
        };
        this.handleEvent = this.handleEvent.bind(this);
    }
    getDateProps() {
        let sDate = this.props.startDate || new Date();
        let eDate = this.props.endDate || new Date();
        if(sDate == '' || !sDate)
            sDate = moment().startOf('month');
        if(eDate == '' || !eDate)
            eDate = moment().endOf('month');
        return {
            startDate: moment(sDate.getFullYear() + '-' + (sDate.getMonth()+1) + '-' + sDate.getDate()),
            endDate: moment(eDate.getFullYear() + '-' + (eDate.getMonth()+1) + '-' + eDate.getDate()),
        };
    }
    getIconOptionFromProps() {
        let flag = true;
        if(this.props.showIcon === false)
            flag = false;
        return flag;
    }
    handleEvent(event, picker) {
        event.preventDefault();
        try{
            this.props.selectDateRange(picker.startDate.format('YYYY,MM,DD'),picker.endDate.format('YYYY,MM,DD'));
        }catch(e) {
        }        
        this.setState({
            startDate: picker.startDate,
            endDate: picker.endDate,
        });
    }
    invalidate() {
        let start = this.state.startDate.format('YYYY-MM-DD');
        let end = this.state.endDate.format('YYYY-MM-DD');
        label = start + ' ~ ' + end;
        if (start === end) {
            label = start;
        }
        return label;
    }
    render() {
        return (
            <DateRangePicker className="dateRangebox" startDate={this.state.startDate} endDate={this.state.endDate} ranges={this.state.ranges} onApply={this.handleEvent}>
                <button className={`selected-date-range-btn gs-button ${this.props.className}`}>
                    {this.state.canShowCalendarIcon && <div className="calendar-icon-div pull-left"><FontAwesomeIcon icon="calendar" className='calendar-icon'/></div> }
                    <div className="pull-right">
                        <span>
                            {this.invalidate()}
                        </span>
                        <span className="arrow-down-icon"><FontAwesomeIcon icon="angle-down" /></span>
                    </div>
                </button>
            </DateRangePicker>
        );
    }
}
export default GsDateRangePicker;
