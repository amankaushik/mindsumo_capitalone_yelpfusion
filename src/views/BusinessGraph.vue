/*
    Code used from: https://github.com/amankaushik/hamburg/blob/master/frontend/hamburg/src/views/ExploreMovie.vue
    I'm the author of the above repo as well.
    Icons used from: https://www.flaticon.com/
*/
<template>
    <div id="graph">
        <div class="local"/>
    </div>
</template>

<script>
    import yelpFusionService from "../../services/yelpFusionService";

    export default {
        name: "BusinessGraph",
        props: {bid: String},
        data() {
            return {}
        },
        mounted() {
            this.getDetails();
        },
        methods: {
            getDetails: function () {
                let parentThis = this;
                yelpFusionService.getBusinessDetails(this.$route.params.bid).then(
                    response => {
                        let d3 = require("d3");
                        let maxNodeSize = 50, root;
                        // eslint-disable-next-line no-unused-vars
                        let side = 0;
                        let graphDiv = document.getElementById("graph");
                        const width = graphDiv.clientWidth;
                        const height = graphDiv.clientHeight;
                        let force = d3.layout.force()
                            .linkDistance(150)
                            .gravity(0.05)
                            .charge(-3000)
                            .friction(0.8)
                            // eslint-disable-next-line no-unused-vars
                            .linkStrength(function (l, i) {
                                return 1;
                            })
                            .size([width, height])
                            .on("tick", tick);

                        let div = d3.select("#graph").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);
                        let svg = d3.select("#graph").append("svg")
                            .attr("width", width)
                            .attr("height", height);
                        let link = svg.selectAll(".link"),
                            node = svg.selectAll(".node");

                        let defs = svg.insert("svg:defs").data(["end"]);
                        defs.enter().append("svg:path")
                            .attr("d", "M0,-5L10,0L0,5");
                        let filterBlur = defs.append('svg:filter')
                            .attr({id: 'blur'});
                        filterBlur.append('feGaussianBlur')
                            .attr({
                                'in': "SourceGraphic",
                                'stdDeviation': 7
                            });
                        let colorScale = d3.scale.linear()
                            .range(["#485563", "#29323c"]);
                        let linearGradient = defs.append("linearGradient")
                            .attr("id", "text-gradient");
                        linearGradient.selectAll("stop")
                            .data(colorScale.range())
                            .enter().append("stop")
                            .attr("offset", function (d, i) {
                                return i / (colorScale.range().length - 1);
                            })
                            .attr("stop-color", function (d) {
                                return d;
                            });

                        function checkFill(d) {
                            return "url(#" + myConcat(d.name, d.level) + ")";
                        }
                        // eslint-disable-next-line no-unused-vars
                        function fillText(d) {
                            return '';
                        }

                        let nodes = [];
                        let links = [];
                        let i = 0;
                        root = parentThis.convertResponseToGraphJson(response.data);
                        createDefs(root);
                        let preloadDefs = document.getElementsByTagName("defs");

                        function preload() {
                            let imageObj = new Image();
                            let images = [];
                            let childNodes = preloadDefs[0].childNodes;
                            childNodes.forEach(function (child) {
                                let href = child.firstChild.href;
                                if (href !== undefined) {
                                    images.push(href.baseVal)
                                }
                            });
                            for (let i = 0; i < images.length; i++) {
                                imageObj.src = images[i];
                            }
                        }

                        preload();
                        svg.append("rect")
                            .attr("width", "100%")
                            .attr("height", "100%")
                            .attr("class", "myRect")
                            .attr("filter", 'url(#blur)')
                            .style("fill", "url(#" + myConcat(root.name, root.level) + "backdrop)");
                        update(root);

                        function update(_root) {
                            let _aux = flatten(_root);
                            nodes.push.apply(nodes, _aux[1]);
                            links.push.apply(links, d3.layout.tree().links([_aux[0]]));
                            {
                                let uid = new Set();
                                let nodesNew = [];
                                for (let _i in nodes) {
                                    if (!uid.has(nodes[_i].id)) {
                                        uid.add(nodes[_i].id);
                                        nodesNew.push(nodes[_i]);
                                    }
                                }
                                nodes = nodesNew;
                            }
                            {
                                let uid = new Set();
                                let linksNew = [];
                                for (let _i in links) {
                                    let tmp = links[_i];
                                    let _id = '' + tmp.source.id + '#' + tmp.target.id;
                                    if (!uid.has(_id)) {
                                        uid.add(_id);
                                        linksNew.push(links[_i]);
                                    }
                                }
                                links = linksNew;
                            }
                            force
                                .nodes(nodes)
                                .links(links)
                                .start();
                            link = link.data(links, function (d) {
                                return d.target.id;
                            });
                            link.exit().remove();
                            link.enter().insert("path", ".node")
                                .attr("class", "link");
                            node = node.data(nodes, function (d) {
                                return d.id;
                            });
                            node.exit().remove();
                            let nodeEnter = node.enter().append("g")
                                .attr("class", "node")
                                .on("click", click)
                                .call(force.drag)
                                .on('dragstart', function (d) {
                                    d3.select(this).classed('fixed', d.fixed = true);
                                    force.stop();
                                })
                                .on('dragend', function () {
                                    force.stop();
                                });
                            nodeEnter.append("circle")
                                .attr("r", function (d) {
                                    if (d.level === 0)
                                        return 62;
                                    return 30;
                                })
                                .style("fill", function (d) {
                                    return checkFill(d);
                                })
                                .style("stroke", "black")
                                .on("mouseover", function (d) {
                                    div.transition()
                                        .duration(200)
                                        .style("opacity", .9);
                                    div.html(d.tooltip || d.name)
                                        .style("left", (d3.event.pageX) + "px")
                                        .style("top", (d3.event.pageY - 28) + "px");
                                })
                                // eslint-disable-next-line no-unused-vars
                                .on("mouseout", function (d) {
                                    div.transition()
                                        .duration(500)
                                        .style("opacity", 0);
                                });
                            nodeEnter.append("text")
                                .text(function (d) {
                                    return fillText(d);
                                })
                                .attr("dy", ".35em");
                        }

                        function tick() {
                            link.attr("d", function (d) {
                                let dx = d.target.x - d.source.x,
                                    dy = d.target.y - d.source.y,
                                    dr = Math.sqrt(dx * dx + dy * dy);
                                return "M" + d.source.x + ","
                                    + d.source.y
                                    + "A" + dr + ","
                                    + dr + " 0 0,1 "
                                    + d.target.x + ","
                                    + d.target.y;
                            });
                            node.attr("transform", nodeTransform);
                        }

                        function updateNodes(d) {
                            if (d.children) {
                                d.children.forEach(function (node) {
                                    updateNodes(node);
                                    let uid = new Set();
                                    {
                                        d.children.forEach(function (node) {
                                            uid.add(node.id);
                                        });
                                        let nodesNew = [];
                                        for (let _i in nodes) {
                                            if (!uid.has(nodes[_i].id)) {
                                                nodesNew.push(nodes[_i]);
                                            }
                                        }
                                        nodes = nodesNew;
                                    }
                                    {
                                        let linksNew = [];
                                        for (let _i in links) {
                                            let tmp = links[_i];
                                            if (!uid.has(tmp.source.id) && !uid.has(tmp.target.id))
                                                linksNew.push(links[_i]);
                                        }
                                        links = linksNew;
                                    }
                                });
                                d._children = d.children;
                                d.children = null;
                            } else {
                                d.children = d._children;
                                d._children = null;
                            }
                        }

                        // Toggle children on click.
                        function click(d) {
                            if (d3.event.defaultPrevented) return; // ignore drag
                            if (d.visibility === true) {
                                d.visibility = false;
                                updateNodes(d);
                            } else {
                                d.visibility = true;
                            }
                            update(d);
                        }

                        // Returns a list of all nodes under the root.
                        function flatten(_root) {
                            let _nodes = [];
                            _root.visibility = true;
                            if (_root.children) {
                                _root.children.forEach(function (node) {
                                    if (!node.id) {
                                        node.id = ++i;
                                    }
                                    node.visibility = false;
                                    _nodes.push(node);
                                });
                            }
                            _root.id = ++i;
                            _nodes.push(root);
                            return [_root, _nodes];
                        }

                        function myConcat(a, b) {
                            if (typeof a === 'string' && b !== undefined && typeof b === 'string') {
                                return a.replace(/\s/g, '') + b.replace(/\s/g, '');
                            } else if (typeof a === 'string' && b !== undefined) {
                                return a.replace(/\s/g, '') + b;
                            } else if (a !== undefined && b !== undefined && typeof b === 'string') {
                                return a + b.replace(/\s/g, '');
                            } else if (a !== undefined && b !== undefined) {
                                return a + b;
                            }
                            return '';
                        }

                        function createDefs(root) {
                            let _w = 500 / 4;
                            let _h = 750 / 4;
                            defs.append("svg:pattern")
                                .attr("id", myConcat(root.name, root.level))
                                .attr("width", 1)
                                .attr("height", 1)
                                .append("svg:image")
                                .attr("href", root.image)
                                .attr("preserveAspectRatio", "none")
                                .attr("width", _w)
                                .attr("height", _h)
                                .attr("x", 0)
                                .attr("y", 0);
                            defs.append("svg:pattern")
                                .attr("id", myConcat(root.name, root.level) + 'backdrop')
                                .attr("width", 1)
                                .attr("height", 1)
                                .append("svg:image")
                                .attr("href", root.image)
                                .attr("viewBox", "0 0 " + width + " " + height)
                                .attr("preserveAspectRatio", "xMidYMid slice")
                                .attr("width", width)
                                .attr("height", height)
                                .attr("x", 0)
                                .attr("y", 0);
                            let _wx = 60;
                            let _hx = 60;
                            function recurse(node) {
                                if (node.children)
                                    node.children.forEach(recurse);
                                if (node.text_only === false || node.text_only === undefined) {
                                    defs.append("svg:pattern")
                                        .attr("id", myConcat(node.name, node.level))
                                        .attr("width", 1)
                                        .attr("height", 1)
                                        .attr("preserveAspectRatio", "none")
                                        .append("svg:image")
                                        .attr("href", node.image)
                                        .attr("viewBox", "0 0 " + _wx + " " + _hx)
                                        .attr("preserveAspectRatio", "xMidYMid slice")
                                        .attr("width", _wx)
                                        .attr("height", _hx)
                                        .attr("x", 0)
                                        .attr("y", 0);
                                }
                            }

                            recurse(root);
                        }

                        function nodeTransform(d) {
                            d.x = Math.max(maxNodeSize, Math.min(width - (d.imgWidth / 2 || 16), d.x));
                            d.y = Math.max(maxNodeSize, Math.min(height - (d.imgHeight / 2 || 16), d.y));
                            return "translate(" + d.x + "," + d.y + ")";
                        }
                    }).catch(
                    error => {
                        console.log(error);
                    }).finally(function () {
                });
            },
            convertResponseToGraphJson: function (data) {
                let graph = {};
                graph["name"] = data["name"];
                graph["image"] = data["image_url"];
                graph["level"] = 0;
                graph["imgWidth"] = 512;
                graph["imgHeight"] = 512;
                graph["children"] = [
                    {
                        name: "Connect",
                        imgWidth: 512,
                        imgHeight: 512,
                        image: "https://hamburg-images.s3.amazonaws.com/connect.png",
                        level: 1,
                        children: [
                            {
                                imgWidth: 512,
                                imgHeight: 512,
                                level: 2,
                                name: "URL",
                                image: "https://hamburg-images.s3.amazonaws.com/search.png",
                                tooltip: data["url"],
                            },
                            {
                                imgWidth: 512,
                                imgHeight: 512,
                                level: 2,
                                name: "Phone",
                                image: "https://hamburg-images.s3.amazonaws.com/phone.png",
                                tooltip: data["display_phone"]
                            },
                            {
                                imgWidth: 512,
                                imgHeight: 512,
                                level: 2,
                                name: "Location",
                                image: "https://hamburg-images.s3.amazonaws.com/maps-and-location.png",
                                tooltip: data["location"]["display_address"].join()
                            }
                        ],
                    },
                    {
                        imgWidth: 512,
                        imgHeight: 512,
                        level: 1,
                        name: "Details",
                        image: "https://hamburg-images.s3.amazonaws.com/info.png",
                        children: [
                            {
                                imgWidth: 512,
                                imgHeight: 512,
                                level: 2,
                                name: "Rating",
                                image: "https://hamburg-images.s3.amazonaws.com/good.png",
                                tooltip: data["rating"],
                            },
                            {
                                imgWidth: 512,
                                imgHeight: 512,
                                level: 2,
                                name: "Price",
                                image: "https://hamburg-images.s3.amazonaws.com/price.png",
                                tooltip: data["price"]
                            },

                        ],
                    },
                    {
                        imgWidth: 512,
                        imgHeight: 512,
                        level: 1,
                        name: "Photos",
                        children: extractPhotos(),
                        image: "https://hamburg-images.s3.amazonaws.com/photo.png"
                    }
                ];
                function extractPhotos() {
                    let photoList = [];
                    for (let i in data["photos"]) {
                        photoList.push({
                            imgWidth: 512,
                            imgHeight: 512,
                            level: 2,
                            name: `Photo-${i}`,
                            image: `${data['photos'][i]}`,
                        })
                    }
                    return photoList;
                }
                return graph;
            }
        }
    }
</script>
<style >
    @import url(http://fonts.googleapis.com/css?family=Source+Code+Pro:400,600);

    text {
        font-family: Consolas, monaco, monospace;
        font-size: 12px;
        text-anchor: middle;
        pointer-events: none;
        color: white;
        stroke: white;
    }

    body {
        font-family: "Source Code Pro", Consolas, monaco, monospace;
        line-height: 160%;
        font-size: 16px;
        margin: 0;
        background-color: black;
    }

    .local {
        min-width: 100%;
        mix-blend-mode: overlay;
    }

    path.link {
        fill: none;
        stroke: #eee;
        stroke-width: 2px;
    }

    a:link {
        color: #EE3124;
        text-decoration: none;
    }

    a:visited {
        color: #EE3124;
    }

    a:hover {
        color: #A4CD39;
        text-decoration: underline;
    }

    a:active {
        color: #EE3124;
    }

    #graph {
        position: fixed;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
    }

    div.tooltip {
        color: #f9f9f9;
        position: absolute;
        text-align: center;
        width: auto;
        height: auto;
        /*padding: 2px;*/
        /*background: lightsteelblue;*/
        border: 1px dotted #8D9DB6;
        padding: 5px;
        border-radius: 3px;
        /*border: 0px;*/
        /*border-radius: 8px;*/
        pointer-events: none;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        background: rgba(110, 130, 163, 0.7);
        z-index: 50;
    }
</style>