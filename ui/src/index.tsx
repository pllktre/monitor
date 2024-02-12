import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { init_monitoring } from "./components/monitoring"
import { Main } from './components/render';

init_monitoring()

ReactDOM.render(
	<React.StrictMode>
		<Main />
	</React.StrictMode>,
	document.getElementById( "root" )
)