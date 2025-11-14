import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const SvgApp = () => {
    const svgRef = useRef();

    useEffect(() => {
	    const svgElement = d3.select(svgRef.current);
	    svgElement.append('circle')
	        .attr('cx', 150)
		.attr('cy', 70)
		.attr('r', 50);
    }, []);

    return (
	<div>
	    <h2>SVG App</h2>
	    <svg ref={svgRef} />
	</div>
    );
};
