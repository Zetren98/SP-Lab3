function generateCode(node) {
    if (!node) return "";
    switch (node.type) {
        case 'Program': return node.body.map(generateCode).join('\n');
        case 'Declaration': return `let ${node.name};`;
        case 'Assignment': return `${node.name} = ${generateCode(node.value)};`;
        case 'Binary': return `(${generateCode(node.left)} ${node.op} ${generateCode(node.right)})`;
        case 'If': 
            let ifStr = `if (${generateCode(node.cond)}) {\n  ${generateCode(node.pass)}\n}`;
            if (node.fail) ifStr += ` else {\n  ${generateCode(node.fail)}\n}`;
            return ifStr;
        case 'While': return `while (${generateCode(node.cond)}) {\n  ${generateCode(node.body)}\n}`;
        case 'Block': return node.body.map(generateCode).join('\n');
        case 'Print': return `myConsolePrint(${generateCode(node.expr)});`;
        case 'Identifier': return node.name;
        case 'Literal': return node.val;
        default: return "";
    }
}
let variables = {};
function evaluate(node) {
    if (!node) return null;
    switch (node.type) {
        case 'Program': node.body.forEach(evaluate); break;
        case 'Declaration': variables[node.name] = 0; break;
        case 'Assignment': variables[node.name] = evaluate(node.value); break;
        case 'Binary':
            let l = evaluate(node.left);
            let r = evaluate(node.right);
            if (node.op === '+') return l + r;
            if (node.op === '-') return l - r;
            if (node.op === '*') return l * r;
            if (node.op === '/') return l / r;
            if (node.op === '<') return l < r;
            if (node.op === '>') return l > r;
            if (node.op === '==') return l == r;
            break;
        case 'If':
            if (evaluate(node.cond)) evaluate(node.pass);
            else if (node.fail) evaluate(node.fail);
            break;
        case 'While':
            while (evaluate(node.cond)) evaluate(node.body);
            break;
        case 'Block': node.body.forEach(evaluate); break;
        case 'Print': 
            document.getElementById('output').innerText += evaluate(node.expr) + '\n';
            break;
        case 'Identifier': return variables[node.name];
        case 'Literal': return node.val;
    }
}

function myConsolePrint(val) {
    document.getElementById('output').innerText += "[Generated JS] " + val + '\n';
}

function buildD3TreeData(node) {
    if (!node) return null;
    let res = { name: node.type };
    switch (node.type) {
        case 'Program': res.name = "Program"; res.children = node.body.map(buildD3TreeData); break;
        case 'Declaration': res.name = `int ${node.name}`; break;
        case 'Assignment': res.name = `=`; res.children = [{name: node.name}, buildD3TreeData(node.value)]; break;
        case 'Binary': res.name = node.op; res.children = [buildD3TreeData(node.left), buildD3TreeData(node.right)]; break;
        case 'If': res.name = "if"; res.children = [buildD3TreeData(node.cond), buildD3TreeData(node.pass)]; if(node.fail) res.children.push(buildD3TreeData(node.fail)); break;
        case 'While': res.name = "while"; res.children = [buildD3TreeData(node.cond), buildD3TreeData(node.body)]; break;
        case 'Block': res.name = "{ }"; res.children = node.body.map(buildD3TreeData); break;
        case 'Print': res.name = "print"; res.children = [buildD3TreeData(node.expr)]; break;
        case 'Identifier': res.name = `id: ${node.name}`; break;
        case 'Literal': res.name = `val: ${node.val}`; break;
    }
    return res;
}

function drawAST(ast) {
    d3.select("#ast-svg").selectAll("*").remove();
    let data = buildD3TreeData(ast);
    let root = d3.hierarchy(data);
    let treeLayout = d3.tree().size([380, 300]);
    treeLayout(root);

    let svg = d3.select("#ast-svg").append("g").attr("transform", "translate(40,20)");

    svg.selectAll('line.link')
        .data(root.links())
        .enter().append('line').classed('link', true)
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    let node = svg.selectAll('g.node')
        .data(root.descendants())
        .enter().append('g').classed('node', true)
        .attr('transform', d => `translate(${d.x},${d.y})`);

    node.append('circle').attr('r', 15);
    node.append('text').attr('dy', -20).attr('text-anchor', 'middle').text(d => d.data.name);
}

function runCompiler() {
    let code = document.getElementById('code').value;
    document.getElementById('output').innerText = "";
    variables = {};
    try {
        let ast = parser.parse(code);
        drawAST(ast);
        let jsCode = generateCode(ast);
        document.getElementById('generatedCode').innerText = jsCode;
        evaluate(ast); 
        
    } catch (e) {
        document.getElementById('output').innerText = "Syntax Error!\n" + e.message;
    }
}