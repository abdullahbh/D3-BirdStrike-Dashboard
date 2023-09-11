// const
// make background colour black
// d3.select("body").style("background-color", "black");



// //add planes image to top and repeat
// 		d3.select("body").append("img")	
// 		.attr("src", "https://www.webintravel.com/wp-content/uploads/2020/05/den-belitsky-GettyImages-854673918-scaled.jpg" )
// 		.attr("width", "100%")
// 		.attr("height", "490")
// 		.attr("x", "0")
// 		.attr("y", "0")
// 		.attr("transform", "translate(0,0)")
// 		.attr("repeat", "repeat");

//add image to a rectangle svg
// d3.select("body").append("svg")
// .attr("width", "100%")
// .attr("height", "150%")
// .attr("x", "0")
// .attr("y", "0")
// .attr("transform", "translate(0,0)")
// .append("image")
// .attr("xlink:href", "https://www.webintravel.com/wp-content/uploads/2020/05/den-belitsky-GettyImages-854673918-scaled.jpg")
// // .attr("xlink:href", "https://media.istockphoto.com/id/807395598/photo/milky-way-and-silhouette-of-a-airplane-landscape-with-passenger-airplane-is-flying-in-the.jpg?b=1&s=170667a&w=0&k=20&c=jG8r5bcWSIy8_m6Yl04bpoa1Vw4BoqNBhE3JWRCWKzM=")
// .attr("width", "100%")
// .attr("height", "710")
// .attr("x", "0")
// .attr("y", "-215")
// .attr("transform", "translate(0,0)");





var title = d3.select("body")
.append("h1")
.text("Heirarchy Visualization")
.attr("id", "title");


var title2 = d3.select("body")
.append("h2")
.text("Click on any of the slices to zoom in")
.style("color", "grey");


  var width = 800;
  var height = 800;
  var maxRadius = (Math.min(width, height) / 2) - 5;

const formatNumber = d3.format(',d');

const x = d3.scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

const y = d3.scaleSqrt()
    .range([maxRadius*.1, maxRadius]);

const color = d3.scaleOrdinal(d3.schemeCategory20);

const partition = d3.partition();

const arc = d3.arc()
    .startAngle(d => x(d.x0))
    .endAngle(d => x(d.x1))
    .innerRadius(d => Math.max(0, y(d.y0)))
    .outerRadius(d => Math.max(0, y(d.y1)));

const middleArcLine = d => {
    const halfPi = Math.PI/2;
    const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }

    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
};

const textFits = d => {
    const CHAR_SPACE = 4;

    const deltaAngle = x(d.x1) - x(d.x0);
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
};

const svg = d3.select('body').append('svg')
    .style('width', '100vw')
    .style('height', '100vh')
    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
    .on('click', () => focusOn()); // Reset zoom on canvas click

d3.json('data/Heirarchy.json', (error, root) => {
    if (error) throw error;
    console.log(root);
    root = d3.hierarchy(root);
    root.sum(d => d.size);

    const slice = svg.selectAll('g.slice')
        .data(partition(root).descendants());

    slice.exit().remove();

    const newSlice = slice.enter()
        .append('g').attr('class', 'slice')
        .on('click', d => {
            d3.event.stopPropagation();
            focusOn(d);
        });

    newSlice.append('title')
        .text(d => d.data.name + '\n' + formatNumber(d.value));

    newSlice.append('path')
        .attr('class', 'main-arc')
        .style('fill', d => color((d.children ? d : d.parent).data.name))
        .attr('d', arc);

    newSlice.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', middleArcLine);

    const text = newSlice.append('text')
        .attr('display', d => textFits(d) ? null : 'none');

    // Add white contour
    text.append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text(d => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 5)
        .style('stroke-linejoin', 'round');

    text.append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text(d => d.data.name);
});

function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    // Reset to top-level if no data point specified

    const transition = svg.transition()
        .duration(750)
        .tween('scale', () => {
            const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]);
            return t => { x.domain(xd(t)); y.domain(yd(t)); };
        });

    transition.selectAll('path.main-arc')
        .attrTween('d', d => () => arc(d));

    transition.selectAll('path.hidden-arc')
        .attrTween('d', d => () => middleArcLine(d));

    transition.selectAll('text')
        .attrTween('display', d => () => textFits(d) ? null : 'none');

    moveStackToFront(d);

    //

    function moveStackToFront(elD) {
        svg.selectAll('.slice').filter(d => d === elD)
            .each(function(d) {
                this.parentNode.appendChild(this);
                if (d.parent) { moveStackToFront(d.parent); }
            })
    }
}
