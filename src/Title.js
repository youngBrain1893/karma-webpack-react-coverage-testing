import React from 'react'
export default class Title extends React.Component {
	constructor(props){
		super(props);
	}
	render(){
		let { text = '', icon = 'edit' } = this.props;
		return (<h2>
				<i className={ 'icon ' + (icon ? ('icon-' + icon) : '')  }></i>
				<span>{text}</span>
			</h2>)
	}
}