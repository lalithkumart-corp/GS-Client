import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import GSCheckbox from '../ui/gs-checkbox/checkbox';
import _, { times } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Category.css';

export default class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryBucket: {},
            showCheckbox: false,
            showActions: true
        }
    }
    componentDidMount() {
        let categoryBucket = [
            {
                id: '1',
                displayText: "Gold",
                checked: true,
                expanded: false,
                childCategory: [
                    {
                        id: 'someid11',
                        displayText: "Chain",
                        checked: true,
                        expanded: false,
                        childCategory: [
                            {
                                id: "someid111",
                                displayText: "Men",
                                checked: true
                            },
                            {
                                id: "someid112",
                                displayText: "Women",
                                checked: true
                            }
                        ]
                    }
                ]
            }
        ];
        this.setState({categoryBucket});
    }

    onToggleClick(status, id) {
        let newState = {...this.state};
        newState.categoryBucket = this.updateExpandedState(this.state.categoryBucket, status, id);
        this.setState(newState);
    }

    onCheckboxUpdate(id, currCheckedStatus) {
        let newState = {...this.state};
        newState.categoryBucket = this.toggleCheckedStatus(this.state.categoryBucket, id);
        this.setState(newState);
    }

    onMouseEnter(id) {
        let newState = {...this.state};
        newState.categoryBucket = this.toggleActionsVisibility(this.state.categoryBucket, id, true);
        this.setState(newState);
    }

    onMouseLeave(id) {
        let newState = {...this.state};
        newState.categoryBucket = this.toggleActionsVisibility(this.state.categoryBucket, id, false);
        this.setState(newState);
    }

    onClickAddSubCategory(categoryId) {
        let newState = {...this.state};
        newState.categoryBucket = this.addInputField(this.state.categoryBucket, categoryId);
        this.setState(newState);
    }

    onChangeText(val, categoryId) {

    }

    updateExpandedState(categoryBucket, status, id) {
        _.each(categoryBucket, (aCateg, index) => {
            if(aCateg.id == id)
                aCateg.expanded = status;
            else if(aCateg.childCategory)
                aCateg.childCategory = this.updateExpandedState(aCateg.childCategory, status, id);
        });
        return categoryBucket;
    }

    toggleCheckedStatus(categoryBucket, id) {
        _.each(categoryBucket, (aCateg, index) => {
            if(aCateg.id == id)
                aCateg.checked = !aCateg.checked;
            else if(aCateg.childCategory)
                aCateg.childCategory = this.toggleCheckedStatus(aCateg.childCategory, id);
        });
        return categoryBucket;
    }

    toggleActionsVisibility(categoryBucket, id, visibility) {
        _.each(categoryBucket, (aCateg, index) => {
            if(aCateg.id == id)
                aCateg.showActions = visibility;
            else if(aCateg.childCategory)
                aCateg.childCategory = this.toggleActionsVisibility(aCateg.childCategory, id, visibility);
        });
        return categoryBucket;
    }

    updateTextVal(categoryBucket, id, val) {
        _.each(categoryBucket, (aCateg, index) => {
            if(aCateg.id == id)
                aCateg.displayText = val;
            else if(aCateg.childCategory)
                aCateg.childCategory = this.updateTextVal(aCateg.childCategory, id, val);
        });
        return categoryBucket;
    }

    addInputField(categoryBucket, id) {
        _.each(categoryBucket, (aCateg, index) => {
            if(aCateg.id == id) {
                aCateg.expanded = true;
                aCateg.childCategory = [{id: +new Date(), new: true, showInputField: true}, ...aCateg.childCategory];
            } else if(aCateg.childCategory)
                aCateg.childCategory = this.addInputField(aCateg.childCategory, id);
        });
        return categoryBucket;
    }

    getInputField(aCategory) {
        let dom = [];
        dom.push(
            <span>
                <input type="text" value={aCategory.displayText} onChange={(e) => this.onChangeText(e.target.value, aCategory.id)}/>
            </span>
        );
        return dom;
    }

    getListItem(aCategory) {
        let dom = [];
        if(aCategory.childCategory) {
            if(aCategory.expanded)
                dom.push(<span onClick={(e) => this.onToggleClick(false, aCategory.id)}><FontAwesomeIcon icon="minus"/></span>);
            else
                dom.push(<span onClick={(e) => this.onToggleClick(true, aCategory.id)}><FontAwesomeIcon icon="plus"/></span>);
        }
        
        if(this.state.showCheckbox)
            dom.push(<GSCheckbox labelText={aCategory.displayText} 
                checked={aCategory.checked}
                className={"small categ-tree"}
                onChangeListener = {(e) => {this.onCheckboxUpdate(aCategory.id, e.target.checked)}} 
            />);
        else
            dom.push(<label>{aCategory.displayText}</label>);
        
        if((this.state.showActions && aCategory.showActions))
            dom.push(<input type="button" className="gs-button action add-sub-categ" value="Add Sub-Category1" onClick={(e)=> this.onClickAddSubCategory(aCategory.id)} />);

        return dom;
    }

    getCategoryDom(list) {
        let dom = [];
        let lists = [];

        _.each(list, (aCategory, index) => {
            let temp = [];
            temp.push(
                <div 
                    className="a-row"
                    onMouseEnter={(e) => this.onMouseEnter(aCategory.id)}
                    onMouseLeave={(e) => this.onMouseLeave(aCategory.id)}
                >
                    {(() => {
                        if(aCategory.new)
                            return this.getInputField(aCategory);
                        else
                            return this.getListItem(aCategory)
                    })()}
                </div>
            )
            if(aCategory.expanded)
                temp.push(this.getCategoryDom(aCategory.childCategory));

            // if(aCategory.childCategory){
                
            // } else {
            //     temp.push(
            //         <div
            //             className="a-row"
            //             onMouseEnter={(e) => this.onMouseEnter(aCategory.id)}
            //             onMouseLeave={(e) => this.onMouseLeave(aCategory.id)}
            //         >
            //             {this.state.showCheckbox ?
            //                 <GSCheckbox labelText={aCategory.displayText} 
            //                 checked={aCategory.checked}
            //                 className={"small categ-tree"}
            //                 onChangeListener = {(e) => {this.onCheckboxUpdate(aCategory.id, e.target.checked)}} />
            //                 :
            //                 <label>{aCategory.displayText}</label>
            //             }
            //             {(this.state.showActions && aCategory.showActions) && 
            //                 <input type="button" className="gs-button action add-sub-categ" value="Add Sub-Category2" />
            //                 // <span className="action add-sub-categ">
            //                 //     Add Sub-Categ
            //                 // </span>
            //             }
            //         </div>
            //     )
            // }
            lists.push(
                <li key={index}>
                    {temp}
                </li>
            )
        });
        dom.push(
            <ul>
                {lists}
            </ul>
        )
        return dom;
    }
    
    render() {
        return (
            <Row>
                <Col className="category-panel" xs={{span: 6}} md={{span: 6}}>
                    {this.getCategoryDom(this.state.categoryBucket)}
                </Col>
            </Row>
        )
    }
}