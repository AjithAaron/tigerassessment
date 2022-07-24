import './FormComponent.css';

const FormComponent = (props) => {
    const classes = 'Form '+ props.className;
    return (<div className={classes}>{props.children}</div>);
}

export default FormComponent;