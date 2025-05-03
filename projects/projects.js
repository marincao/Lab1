import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON("../lib/projects.json");
const projectsContainer = document.querySelector(".projects");
renderProjects(projects, projectsContainer, "h2");

const projectTitle = document.querySelector(".projects-title");
projectTitle.innerHTML = `${projects.length} ` + projectTitle.innerHTML;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return {value: count, label: year}; // TODO
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);;
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    // TODO: clear up paths and legends
    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();
    let newLegend = d3.select('.legend');
    newLegend.selectAll('li').remove();
    // update paths and legends, refer to steps 1.4 and 2.2
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    newArcs.forEach((arc, idx) => {
    d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
    })
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
    legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    newArcs.forEach((arc, i) => {
        svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
        // What should we do? (Keep scrolling to find out!)
            selectedIndex = selectedIndex === i ? -1 : i;
            svg
            .selectAll('path')
            .attr('class', (_, idx) => (
            // TODO: filter idx to find correct pie slice and apply CSS from above
                idx === selectedIndex ? 'selected' : ''
            ));

        legend
        .selectAll('li')
        .attr('class', (_, idx) => (
        // TODO: filter idx to find correct legend and apply CSS from above
            idx === selectedIndex ? 'selected' : ''
        ));
        if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
        } else {
            // TODO: filter projects and project them onto webpage
            // Hint: `.label` might be useful
            let selectedYear = newData[selectedIndex].label;
            let filteredProjects = projectsGiven.filter((p) => p.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
        }
    });
    });
}


renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    // filter projects
    let filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    });
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
