$(document).ready(function(){
	var dataset = [];

	for (var i=0; i < 20; i++){
		var newNum = 5 + Math.floor(Math.random() * 30);
		dataset.push(newNum);
	}

	d3.select('.d0622').selectAll('div')
		.data(dataset) // D3 data computing
		.enter() 
		.append('div')
		.attr('class','bar')
		.style('height', function(d){
			return (d*3)  + 'px'
		})	

	console.log(dataset)
})
 