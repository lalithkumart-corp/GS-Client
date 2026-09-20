import { RiCheckLine, RiCheckDoubleLine } from 'react-icons/ri';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { TAGS } from '../../constants';
import './tag.scss';

export function TagInputComp(props) {

    let getTagItem = (aTag, index) => {
        let clsName = `a-tag-item ${aTag}`;
        if(props.selected && props.selected == index)
            clsName += " selected-tag";

        return (
            <span key={`tag-ui-${index}`} className={clsName} onClick={(e)=>props.onClick(aTag, index)}>
                {aTag=='doubletick' && <RiCheckDoubleLine />}
                {aTag=='tick' && <RiCheckLine />}
                {aTag=='cross'&& <AiOutlineCloseCircle />}
            </span>
        )
    }

    let getTagComp = () => {
        let tagsDom = [];
        _.each(TAGS, (aTag, index)=>{
            tagsDom.push(
                getTagItem(aTag, index)
            );
        });
        let titleTxt = '';
        if(props.titleText == undefined) 
            titleTxt = "Add a Tag";
        else
            titleTxt = props.titleText;

        return (
            <div className="dropdown-item-custom tags gs-tag-input-component">
                <p style={{marginBottom: '3px'}}>{titleTxt}</p>
                {tagsDom}
            </div>
        );
    }
    
    return (
        <span className="gs-tag-input-component">
            {getTagComp()}
        </span>
    )
}

export function TagDisplayComp(props) {
    let getTagItem = (aTag, index) => {
        return (
            <span key={`tag-ui-${index}`} className={`a-tag-item ${aTag}`}>
                {aTag=='doubletick' && <RiCheckDoubleLine />}
                {aTag=='tick' && <RiCheckLine />}
                {aTag=='cross'&& <AiOutlineCloseCircle />}
            </span>
        )
    }
    return (
        <span className="gs-tag-view-component">
            {getTagItem(props.tagVal, props.tagNo)}
        </span>
    )
}