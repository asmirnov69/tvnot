import React, { Component } from 'react';
import ReactDataGrid from 'react-data-grid';

function createRows() {
    const rows = [];
    const row = { topic: '/a', message: 'Hello',
		  children: [{topic: '/a/b', message: 'Hello Hello', children: [
		      {topic: '/a/b/c', message: 'Hello Hello Hello'}]}]};
    rows.push(row);
    const row1 = { topic: '/B', message: 'Hello',
		  children: [{topic: '/B/b', message: 'Hello Hello', children: [
		      {topic: '/B/b/c', message: 'Hello Hello Hello'}]}]};
    
    rows.push(row1);
    return rows;
}

function createRowsFromTopics(topics) {
    return Object.entries(topics).map(([k, v]) => {
	return { topic: v[0], message: v[1] };
    });
}


const columns = [
  {
    key: 'topic',
    name: 'topic'
  },
  {
    key: 'message',
    name: 'message'
  }
];


class App extends Component {
    constructor (props) {
	super(props);
	const rows = createRowsFromTopics([]);
	this.state = { expanded: {}, rows };
    }
    
    setSocketListeners () {
	this.props.socket.on('topics', (topics) => {
	    console.log("received topcis", topics);	    
	    //this.setState({topics: topics});
	    const expanded = { ...this.state.expanded };
	    const rows = createRowsFromTopics(topics);
	    this.setState({expanded, rows});
	});
    }

    componentDidMount () {
	this.setSocketListeners();
    }

    getRows = (i) => {
	return this.state.rows[i];
    };

    getSubRowDetails = (rowItem) => {
	const isExpanded = this.state.expanded[rowItem.topic] ? this.state.expanded[rowItem.topic] : false;
	return {
	    group: rowItem.children && rowItem.children.length > 0,
	    expanded: isExpanded,
	    children: rowItem.children,
	    field: 'topic',
	    treeDepth: rowItem.treeDepth || 0,
	    siblingIndex: rowItem.siblingIndex,
	    numberSiblings: rowItem.numberSiblings
	};
    };

    onCellExpand = (args) => {
	const rows = this.state.rows.slice(0);
	const rowKey = args.rowData.topic;
	const rowIndex = rows.indexOf(args.rowData);
	const subRows = args.expandArgs.children;

	const expanded = { ...this.state.expanded };
	if (expanded && !expanded[rowKey]) {
	    expanded[rowKey] = true;
	    this.updateSubRowDetails(subRows, args.rowData.treeDepth);
	    rows.splice(rowIndex + 1, 0, ...subRows);
	} else if (expanded[rowKey]) {
	    expanded[rowKey] = false;
	    rows.splice(rowIndex + 1, subRows.length);
	}

	this.setState({ expanded, rows });
    };

    updateSubRowDetails = (subRows, parentTreeDepth) => {
	const treeDepth = parentTreeDepth || 0;
	subRows.forEach((sr, i) => {
	    sr.treeDepth = treeDepth + 1;
	    sr.siblingIndex = i;
	    sr.numberSiblings = subRows.length;
	});
    };

    render () {
	//var topics = this.state.topics;
	//var rows = Object.entries(topics).map(([k, v]) => {
	//    return (<tr><td>{v[0]}</td><td>{v[1]}</td></tr>);
	//});
	//return (
	//    <div>
	//	<table>
	//	<th><td>K</td><td>V</td></th>
	//	{rows}
	//	</table>
	//	</div>
	//	
	//);
	return (
      <ReactDataGrid
        enableCellSelect
        columns={columns}
        rowGetter={this.getRows}
        rowsCount={this.state.rows.length}
        getSubRowDetails={this.getSubRowDetails}
        minHeight={500}
        onCellExpand={this.onCellExpand}
      />
	);

    }
};	    

export default App;