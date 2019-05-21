import React from 'react';
import ImageUploader from 'react-images-upload';
 
class UploadPicDemo extends React.Component {
 
    constructor(props) {
        super(props);
         this.state = { image: null };
         this.handleChangeImage = this.handleChangeImage.bind(this);
    }

    handleChangeImage(evt) {
        console.log("Uploading");
        var self = this;
        var reader = new FileReader();
        var file = evt.target.files[0];

        reader.onload = (upload) => {
            this.setState({
                image: upload.target.result
            });
        };
        
        reader.readAsDataURL(file);                
    }
 
    render() {
        return (
            <div>
                <input ref="file" type="file" name="file" 
                    className="upload-file" 
                    id="file"
                    onChange={this.handleChangeImage}
                    encType="multipart/form-data" 
                    required/>
                <img src={this.state.image} className='image-viewer'/>
            </div>            
        );
    }
}

export default UploadPicDemo;