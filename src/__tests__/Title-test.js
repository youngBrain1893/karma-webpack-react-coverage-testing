import React from 'react'  
// 低版本react 
// import React from 'react/addons'
import TestUtils from 'react-addons-test-utils'
// 低版本react
// const TestUtils = React.addons.TestUtils;

import Title from '../Title'

['edit', 'finish'].map((icon)=>{
    ['Edit text', 'Finish text'].map((text)=>{
		describe(`<Title icon=${icon} text=${text} />`, ()=>{
			let title = TestUtils.renderIntoDocument(<Title icon={icon} text={text} />);


			it(`there sholud has the icon has class icon-${icon}`, ()=>{
            	let iconDom = TestUtils.findRenderedDOMComponentWithClass(title, `icon-${icon}`);
            	expect(iconDom).toBeDefined();
          	})

          	it(`text should to be ${text}`, ()=>{
          		let textDom = TestUtils.findRenderedDOMComponentWithTag(title, 'span');
          		expect(textDom.textContent).toEqual(`${text}`)
          	})
        })
    })
})

