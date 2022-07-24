import './FormComponent.css';

/**
* FormComponent are used to Higher Order Components features
* @param props
*/
const FormComponent = (props) => {
    const classes = 'Form '+ props.className;
    return (<div className={classes}>{props.children}</div>);
}

export default FormComponent;