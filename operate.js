////////////////////////////////// OOP
class Source {
    constructor(elements) {
        this.elements = elements;
    }
    generateData() {
      throw new Error('Method not implemented');
    }
}

class Diagram extends Source {
    
    constructor(elements, javas){
        super(elements);
        this.javas = javas;
    }

    translate_java() {
        for(let i = 0; i < this.javas.length; i++){
            var class_curr = this.javas[i];
            var class_name = class_curr[0]; 
            var class_atrs = [];
            if(class_curr[1] !== null){
                for(let j = 0; j < class_curr[1].length; j++){
                    var atr = class_curr[1][j];
                    var atr_words = atr.split(" ");
                    if(atr_words.length > 2 ){
                        var atrModifier = atr_words[0];
                        if(atrModifier === "public"){
                            var atrModifierSymbol = "+";
                        } else if(atrModifier === "private"){
                            var atrModifierSymbol = "-";
                        } else if(atrModifier === "protected"){
                            var atrModifierSymbol = "#";
                        }
                        var atrType = atr_words[1];
                        var atrName = atr_words[2].slice(0, -1); // ilangin ";" dari nama
                        class_atrs.push(atrModifierSymbol + atrName + ": " + atrType);
                    } else {
                        var atrType = atr_words[0];
                        var atrName = atr_words[1].slice(0, -1); // ilangin ";" dari nama
                        class_atrs.push("+" + atrName + ": " + atrType);
                    }
                }
            } else {
                class_atrs = "";
            }
            var class_meths = [];
            if(class_curr[2] !== null){
                for(let j = 0; j < class_curr[2].length; j++){
                    var meth = class_curr[2][j];
                    const regex = /^(public|protected|private)?\s*(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{?/;
                    const matches = meth.match(regex);
                    if (matches) {
                        const modifier = matches[1] ? matches[1].trim() : "default"; // Jika modifier tidak ada, gunakan "default"
                        const returnType = matches[2];
                        const methodName = matches[3];
                        const parameter = matches[4];

                        if(modifier === "private"){
                            class_meths.push("-" + methodName + " (" + parameter + " ) : " + returnType);
                        } else if (modifier === "protected"){
                            class_meths.push("#" + methodName + " (" + parameter + " ) : " + returnType);
                        } else {
                            class_meths.push("+" + methodName + " (" + parameter + " ) : " + returnType);
                        }
                    } else {
                        class_meths = "";
                    }
                }
            } else {
                class_meths = "";
            }
            
            var words = class_name.split(" ");
            var classD = words.slice(0, 4); // dislice buat ambil deklarasi classnya aja, relasinya gausah
            if(classD[1] !== "abstract"){
                newClass(classD[2],classD[1],class_atrs,class_meths);
            } else {
                newClass(classD[3],classD[1],class_atrs,class_meths);
            }
        }
        this.generateClassDiagram(this.javas);
    }

    generateClassDiagram(el){
        var allElement = graph.getElements();
        var relations = [];
        console.log('el',el);
        for(let i = 0; i < el.length; i++){
            var class_curr = el[i];
            // Untuk generalisasi sama implements, pakenya deklarasi classnya aja
            var class_name = class_curr[0];
            var words = class_name.split(" ");
            if(words[3] === "extends" || words[4] === "extends"){
                var subclassName = words[2];
                var superclassName = words[4];
                var source = "";
                var target = "";
                for(let j = 0; j < allElement.length; j++){
                    if(subclassName === allElement[j].attributes.name){
                        source = allElement[j].attributes.id;
                    }
                    if(superclassName === allElement[j].attributes.name){
                        target = allElement[j].attributes.id;
                    }
                }
                relations.push(new uml.Generalization({ source: { id: source }, target: { id: target }}));
            } 
            if(words[3] === "implements" || words[4] === "implements"){
                var subclassName = words[2];
                var superclassName = words[4];
                var source = "";
                var target = "";
                for(let j = 0; j < allElement.length; j++){
                    if(subclassName === allElement[j].attributes.name){
                        source = allElement[j].attributes.id;
                    }
                    if(superclassName === allElement[j].attributes.name){
                        target = allElement[j].attributes.id;
                    }
                }
                relations.push(new uml.Implementation({ source: { id: source }, target: { id: target }}));
            }
            // Aggregasi. Karena mirip sama dependensi, array depend harus kosong
            if (class_curr[4].length > 0 && class_curr[7].length < 1 && class_curr[5].length < 1) {
                for(let j = 0; j < class_curr[4].length; j++){
                    var aso_curr = class_curr[4][j];
                    if(words.includes('abstract')) {
                        var superClass = words[3];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name.toLowerCase())){
                                var source = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var target = allElement[l].attributes.id;
                                        relations.push(new uml.Aggregation({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    } else {
                        var superClass = words[2];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name.toLowerCase())){
                                var source = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var target = allElement[l].attributes.id;
                                        relations.push(new uml.Aggregation({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    }
                }
            
            }
            // asosiasi
            if (class_curr[5].length > 0) {
                for(let j = 0; j < class_curr[5].length; j++){
                    var aso_curr = class_curr[5][j];
                    if(words.includes('abstract')) {
                        var superClass = words[3];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name)){
                                var source = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var target = allElement[l].attributes.id;
                                        relations.push(new uml.Association({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    } else {
                        var superClass = words[2];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name)){
                                var source = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var target = allElement[l].attributes.id;
                                        relations.push(new uml.Association({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    }
                }
            
            }
            // komposisi
            if (class_curr[6].length > 0) {
                for(let j = 0; j < class_curr[6].length; j++){
                    var aso_curr = class_curr[6][j];
                    if(words.includes('abstract')) {
                        var superClass = words[3];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name)){
                                var source = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var target = allElement[l].attributes.id;
                                        relations.push(new uml.Composition({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    } else {
                        var superClass = words[2];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name)){
                                var source = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var target = allElement[l].attributes.id;
                                        relations.push(new uml.Composition({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    }

                }
            
            }
            // dependensi 
            if (class_curr[7].length > 0) {
                for(let j = 0; j < class_curr[7].length; j++){
                    var aso_curr = class_curr[7][j];
                    if(words.includes('abstract')) {
                        var superClass = words[3];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name.toLowerCase())){
                                var target = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var source = allElement[l].attributes.id;
                                        relations.push(new uml.Dependency({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    } else {
                        var superClass = words[2];
                        for(let k = 0; k < allElement.length; k++){
                            var class_name = allElement[k].attributes.name;
                            if(aso_curr.includes(class_name.toLowerCase())){
                                var target = allElement[k].attributes.id;
                                for(let l = 0; l < allElement.length; l++){
                                    if(superClass === allElement[l].attributes.name){
                                        var source = allElement[l].attributes.id;
                                        relations.push(new uml.Dependency({ source: { id: source }, target: { id: target }}));
                                    }
                                }
                            }   
                        }
                    }
                }
            }
        }
        Object.keys(relations).forEach(function(key) {
            graph.addCell(relations[key]);
        });
    }

    generateData() {
        html2canvas(this.elements)
        .then(canvas => {
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
            return canvas;
        })
        .then(canvas => {
            const image = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.setAttribute('download', 'ClodeExported.png');
            a.setAttribute('href', image);
            a.click();
            canvas.remove();
        });
    }
}

class Translation extends Source {

    constructor(elements){
        super(elements);
    }

    getRelation(){
        console.log('el',this.elements)
        //         0,       1,   2,    3,   4
        // jenis relasi, target, _, source, _
        // 1 bikin 3

        var allLinks = graph.getLinks();
        var target = [];
        var target_class = [];
        var source = [];
        var source_Class = [];
        var rel = [];
        var list = [];
        var full_list = [];
        var el_id = [];
        var el_related_id = [];

        // ngambil data link (relasi)
        for(let i = 0; i < allLinks.length; i++){
            el_related_id.push(allLinks[i].attributes.target.id);
            el_related_id.push(allLinks[i].attributes.source.id);
            for(let j = 0; j < this.elements.length; j++){
                el_id.push(this.elements[j].attributes.id);
                if(allLinks[i].attributes.target.id === this.elements[j].attributes.id){
                    rel.push(allLinks[i].attributes.type);
                    target.push(this.elements[j].attributes.name);
                    target_class.push(this.elements[j].attributes.type);
                }
                if(allLinks[i].attributes.source.id === this.elements[j].attributes.id){
                    source.push(this.elements[j].attributes.name);
                    source_Class.push(this.elements[j].attributes.type);
                }
            }
            // gabungin jenis relasi, target, sama source jadi 1 array
            list = rel.concat(target, target_class, source, source_Class);
            // masukin ke list data relasi antar kelas
            full_list.push(list);
            
            rel = [];
            target = [];
            target_class = [];
            source = [];
            source_Class = [];
            list = [];
        }

        // Class sendirian
        var el_noRelated = [];
        if(el_id.length > 0){
            el_noRelated = el_id.filter(function(element) {
                return !el_related_id.includes(element);
            });
        } else {
            for(let j = 0; j < this.elements.length; j++){
                el_noRelated.push(this.elements[j].attributes.id);
            }
        }

        for(let i = 0; i < el_noRelated.length; i++){
            for(let j =0; j < this.elements.length; j++){
                if(el_noRelated[i] === this.elements[j].attributes.id){
                    full_list.push(this.elements[j].attributes.name);
                }
            }
        }

        return full_list;
    }

    general(rel){
        var translate = [];
        var param_super = "";
        var atrName_super = [];
        var meth_superClass = [];

        for(let i = 0; i < this.elements.length; i++){
            var target = rel[1];
            var source = rel[3];
            // superclass
            if(target === this.elements[i].attributes.name){
                var meth_target = this.elements[i].attributes.methods;
                var tAtr_target = this.elements[i].attributes.attributes;
                atrName_super = tAtr_target.map(function(item) {
                    var parts = item.split(":");
                    var substringValue = parts[0].trim().substring(1);
                    return substringValue;
                });
                var param_list = [];
                var atr_list = [];
                var atr_super = "";
                if(tAtr_target[0] === ''){
                    param_super = "";
                    atr_super = "";
                    var super_key = "";
                } else {
                    for(let j = 0; j < tAtr_target.length; j++) {
                        var parts = tAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_super[j] + " = " + atrName_super[j] + ";");
                    }
                    param_super = param_list.join(', ');
                    atr_super = atr_list.join('\n');
                    var super_key = atrName_super.join(',');
                }
                if(rel[2] === "uml.Class"){
                    translate.push(
                    { 
                        nameClass: target,
                        class_d: "public class " + target + " {",
                        const: "public " + target,
                        param: param_super,
                        atr_const: atr_super,
                        super: super_key,
                        atrConst_sub: [],
                        atr_sub: [],
                        param_sub: [],
                        meth_sub_aso: [],
                        granny: true
                    }
                    );
                    
                }
                if(rel[2] === "uml.Abstract"){
                    if(meth_target[0] !== ''){ // buat subclass
                        for(let j = 0; j < meth_target.length; j++) {
                            var parts = meth_target[j].split(":");
                            var variableType = parts[1].trim();
                            var variableName = parts[0].substring(1).trim();
                            var updatedString = "@Override\npublic " + variableType + " " + variableName + " {\n\n}\n";
                            meth_superClass.push(updatedString);
                        }
                    }
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public abstract class " + target + " {",
                            const: "public " + target,
                            param: param_super,
                            atr_const: atr_super,
                            super: super_key,
                            meth_sub_aso: [],
                            granny: true
                        }
                        );
                }
                if(rel[2] === "uml.Interface"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public interface " + target + " {",
                            granny: true,
                            meth_sub_aso: []
                        }
                        );
                }
            }
            // subclass
            if(source === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var sAtr_target = this.elements[i].attributes.attributes;
                var atrName_sub = sAtr_target.map(function(item) {
                        var parts = item.split(":");
                        var substringValue = parts[0].trim().substring(1);
                        return substringValue;
                    });
                if(sAtr_target[0] !== ''){
                    for(let j = 0; j < sAtr_target.length; j++) {
                        var parts = sAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_sub[j] + " = " + atrName_sub[j] + ";");
                    }
                    var param = param_list.join(', ');
                    var atr = atr_list.join('\n');
                    var super_key = atrName_sub.join(',');
                } else {
                    var param = "";
                    var atr = "";
                    var super_key = "";
                }
                if(rel[4] === "uml.Class"){
                    translate.push(
                    {
                        nameClass: source,
                        superClass: target,
                        class_d: "public class " + source + " extends " + target + " {\n",
                        const: "public " + source,
                        param: param,
                        atr_const: atr,
                        super: super_key,
                        atrConst_sub: [],
                        atr_sub: [],
                        param_sub: [],
                        meths: meth_superClass,
                        meth_sub_aso: [],
                        ggchild: true
                    }
                    );
                }
                if(rel[4] === "uml.Abstract"){
                    translate.push(
                        {
                            nameClass: source,
                            superClass: target,
                            class_d: "public abstract class " + source + " extends " + target + " {\n",
                            const: "public " + source,
                            param: param,
                            atr_const: atr,
                            super: super_key,
                            atrConst_sub: [],
                            atr_sub: [],
                            param_sub: [],
                            meths: meth_superClass,
                            meth_sub_aso: [],
                            ggchild: true
                        }
                        );
                }
                if(rel[4] === "uml.Interface"){
                    if(rel[2] !== "uml.Interface"){
                        alert("Translation failed! " + rel_curr[1] + " cannot be the superclass of " + rel_curr[3]);
                    } else {
                        translate.push(
                            {
                                nameClass: source,
                                superClass: target,
                                class_d: "public interface " + source + " extends " + target + " {",
                                meths: meth_superClass,
                                meth_sub_aso: [],
                            }
                            );
                    }
                }
            }
        } 
        return translate;
    }

    agregation(rel){
        var translate = [];

        for(let i = 0; i < this.elements.length; i++){
            var target = rel[1];
            var source = rel[3];
            // superclass
            if(target === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var tAtr_target = this.elements[i].attributes.attributes;
                var atrName_super = tAtr_target.map(function(item) {
                    var parts = item.split(":");
                    var substringValue = parts[0].trim().substring(1);
                    return substringValue;
                });
                if(tAtr_target[0] !== ''){
                    for(let j = 0; j < tAtr_target.length; j++) {
                        var parts = tAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_super[j] + " = " + atrName_super[j] + ";");
                    }
                    var param_super = param_list.join(', ');
                    var atr_super = atr_list.join('\n');
                    var super_key = atrName_super.join(',');
                } else {
                    var param_super = "";
                    var atr_super = "";
                    var super_key = "";
                }
                
                if(rel[2] === "uml.Class"){
                    translate.push(
                    { 
                        nameClass: target,
                        class_d: "public class " + target + " {",
                        const: "public " + target,
                        param: param_super,
                        atr_const: atr_super,
                        super: super_key,
                        atr_sub: [],
                        atrConst_sub: [],
                        atr_ofSuper: "private " + target + " " + target.toLowerCase() + ";",
                        param_sub: [],
                        meth_sub_aso: [],
                        agg: true
                    }
                    );
                    
                }
                if(rel[2] === "uml.Abstract"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public abstract class " + target + " {",
                            const: "public " + target,
                            param: param_super,
                            atr_const: atr_super,
                            super: super_key,
                            atr_sub: [],
                            atrConst_sub: [],
                            param_sub: [],
                            meth_sub_aso: [],
                            agg: true
                        }
                        );
                }
                if(rel[2] === "uml.Interface"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public interface " + target + " {",
                            const: "",
                            param: "",
                            atr_const: "",
                            super: "",
                            atr_sub: [],
                            atrConst_sub: [],
                            param_sub: [],
                            meth_sub_aso: [],
                            interface: true
                        }
                        );
                }
            }
            // subclass
            if(source === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var sAtr_target = this.elements[i].attributes.attributes;
                var atrName_sub = sAtr_target.map(function(item) {
                        var parts = item.split(":");
                        var substringValue = parts[0].trim().substring(1);
                        return substringValue;
                    });
                if(sAtr_target[0] !== ''){
                    for(let j = 0; j < sAtr_target.length; j++) {
                        var parts = sAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_sub[j] + " = " + atrName_sub[j] + ";");
                    }
                    var param_sub = param_list.join(', ');
                    var atr = atr_list.join('\n');
                } else {
                    var param_sub = "";
                    var atr = "";
                }
                
                if(rel[4] === "uml.Class"){
                    translate.push(
                    {
                        nameClass: source,
                        class_d: "public class " + source + " {",
                        const: "public " + source + " (" + param_sub + ") {" + 
                        "\n" +  atr + "\n" +
                        "}",
                        atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                        atrConst_ofSuper: "this." + source.toLowerCase() + " = " + source.toLowerCase() + "; // Agregasi",
                        aggClass: target,
                        atrConst_sub: [],
                        atr_sub: [],
                        param_ofSuper: source + " " + source.toLowerCase(),
                        meth_sub_aso: []
                    }
                    );
                }
                if(rel[4] === "uml.Abstract"){
                    translate.push(
                        {
                            nameClass: source,
                            class_d: "public abstract class " + source + " {",
                            const: "public " + source + " (" + param_sub + ") {" + 
                            "\n" +  atr + "\n" +
                            "}",
                            atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                            atrConst_ofSuper: "this." + source.toLowerCase() + " = " + source.toLowerCase() + "; // Agregasi",
                            aggClass: target,
                            atrConst_sub: [],
                            atr_sub: [],
                            param_ofSuper: source + " " + source.toLowerCase(),
                            meth_sub_aso: []
                        }
                        );
                }
                if(rel[4] === "uml.Interface"){
                    translate.push(
                        {
                            nameClass: source,
                            class_d: "public interface " + source + " {",
                            const: "",
                            atr_ofSuper: "",
                            atrConst_ofSuper: "",
                            aggClass: target,
                            atrConst_sub: [],
                            atr_sub: [],
                            param_ofSuper: "",
                            meth_sub_aso: [],
                            interface: true
                        }
                        );
                }
            }
        }
        return translate;
    }

    composit(rel){
        var translate = [];

        for(let i = 0; i < this.elements.length; i++){
            var target = rel[1];
            var source = rel[3];
            // superclass
            if(target === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var tAtr_target = this.elements[i].attributes.attributes;
                var atrName_super = tAtr_target.map(function(item) {
                    var parts = item.split(":");
                    var substringValue = parts[0].trim().substring(1);
                    return substringValue;
                });
                if(tAtr_target[0] !== ''){
                    for(let j = 0; j < tAtr_target.length; j++) {
                        var parts = tAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_super[j] + " = " + atrName_super[j] + ";");
                    }
                    var param_super = param_list.join(', ');
                    var atr_super = atr_list.join('\n');
                    var super_key = atrName_super.join(',');
                } else {
                    var param_super = "";
                    var atr_super = "";
                    var super_key = "";
                }
                
                if(rel[2] === "uml.Class"){
                    translate.push(
                    { 
                        nameClass: target,
                        class_d: "public class " + target + " {",
                        const: "public " + target + " (" + param_super + ") {",
                        param: param_super,
                        atr_const: atr_super,
                        super: super_key,
                        atr_sub: [],
                        atrConst_sub: [],
                        param_sub: [],
                        meth_sub_aso: [],
                        comp: true
                    }
                    );
                    
                }
                if(rel[2] === "uml.Abstract"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public abstract class " + target + " {",
                            const: "public " + target + " (" + param_super + ") {",
                            param: param_super,
                            atr_const: atr_super,
                            super: super_key,
                            atr_sub: [],
                            atrConst_sub: [],
                            param_sub: [],
                            meth_sub_aso: [],
                            comp: true
                        }
                        );
                }
                if(rel[2] === "uml.Interface"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public interface " + target + " {",
                            const: "",
                            param: "",
                            atr_const: "",
                            super: "",
                            atr_sub: [],
                            atrConst_sub: [],
                            param_sub: [],
                            meth_sub_aso: [],
                            interface: true
                        }
                        );
                }
            }
            // subclass
            if(source === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var sAtr_target = this.elements[i].attributes.attributes;
                var atrName_sub = sAtr_target.map(function(item) {
                        var parts = item.split(":");
                        var substringValue = parts[0].trim().substring(1);
                        return substringValue;
                    });
                if(sAtr_target[0] !== ''){
                    for(let j = 0; j < sAtr_target.length; j++) {
                        var parts = sAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_sub[j] + " = " + atrName_sub[j] + ";");
                    }
                    var param_sub = param_list.join(', ');
                    var atr_sub = atr_list.join('\n');
                } else {
                    var param_sub = "";
                    var atr_sub = "";
                }
                
                if(rel[4] === "uml.Class"){
                    translate.push(
                    {
                        nameClass: source,
                        class_d: "public class " + source + " {",
                        const: "public " + source + " (" + param_sub + ") {" + 
                        "\n" +  atr_sub + "\n" +
                        "}",
                        const_noParam: "public " + source + " () {\n\n" + 
                        "}",
                        atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                        atrConst_ofSuper: "this." + source.toLowerCase() + " = new " + source + "(); // Komposisi",
                        compClass: target,
                        atrConst_sub: [],
                        atr_sub: [],
                        meth_sub_aso: []
                    }
                    );
                }
                if(rel[4] === "uml.Abstract"){
                    translate.push(
                        {
                            nameClass: source,
                            class_d: "public abstract class " + source + " {",
                            const: "public " + source + " (" + param_sub + ") {" + 
                            "\n" +  atr_sub + "\n" +
                            "}",
                            atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                            atrConst_ofSuper: source.toLowerCase() + " = new " + source + "(); // Komposisi",
                            compClass: target,
                            atrConst_sub: [],
                            atr_sub: [],
                            meth_sub_aso: []
                        }
                        );
                }
                if(rel[4] === "uml.Interface"){
                    translate.push(
                        {
                            nameClass: source,
                            class_d: "public interface " + source + " {",
                            const: "",
                            atr_ofSuper: "",
                            atrConst_ofSuper: "",
                            compClass: target,
                            atrConst_sub: [],
                            atr_sub: [],
                            meth_sub_aso: [],
                            interface: true
                        }
                        );
                }
            }
        }
        return translate;
    }

    asosi(rel){
        var translate = [];

        for(let i = 0; i < this.elements.length; i++){
            var target = rel[1];
            var source = rel[3];
            // superclass
            if(target === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var tAtr_target = this.elements[i].attributes.attributes;
                var atrName_super = tAtr_target.map(function(item) {
                    var parts = item.split(":");
                    var substringValue = parts[0].trim().substring(1);
                    return substringValue;
                });
                if(tAtr_target[0] !== ''){
                    for(let j = 0; j < tAtr_target.length; j++) {
                        var parts = tAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_super[j] + " = " + atrName_super[j] + ";");
                    }
                    var param_super = param_list.join(', ');
                    var atr_super = atr_list.join('\n');
                    var super_key = atrName_super.join(',');
                } else {
                    var param_super = "";
                    var atr_super = "";
                    var super_key = "";
                }
                
                if(rel[2] === "uml.Class"){
                    translate.push(
                    { 
                        nameClass: target,
                        class_d: "public class " + target + " {",
                        const: "public " + target,
                        param: param_super,
                        atr_const: atr_super,
                        super: super_key,
                        atr_sub: [],
                        atrConst_sub: [],
                        param_sub: [],
                        meth_sub_aso: [],
                        aso: true
                    }
                    );
                    
                }
                if(rel[2] === "uml.Abstract"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public abstract class " + target + " {",
                            const: "public " + target,
                            param: param_super,
                            atr_const: atr_super,
                            super: super_key,
                            atr_sub: [],
                            atrConst_sub: [],
                            param_sub: [],
                            meth_sub_aso: [],
                            aso: true
                        }
                        );
                }
                if(rel[2] === "uml.Interface"){
                    translate.push(
                        { 
                            nameClass: target,
                            class_d: "public interface " + target + " {",
                            const: "",
                            param: "",
                            atr_const: "",
                            super: "",
                            atr_sub: [],
                            atrConst_sub: [],
                            param_sub: [],
                            meth_sub_aso: [],
                            interface: true
                        }
                        );
                }
            }
            // subclass
            if(source === this.elements[i].attributes.name){
                var param_list = [];
                var atr_list = [];
                var sAtr_target = this.elements[i].attributes.attributes;
                var atrName_sub = sAtr_target.map(function(item) {
                        var parts = item.split(":");
                        var substringValue = parts[0].trim().substring(1);
                        return substringValue;
                    });
                if(sAtr_target[0] !== ''){
                    for(let j = 0; j < sAtr_target.length; j++) {
                        var parts = sAtr_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atrName_sub[j] + " = " + atrName_sub[j] + ";");
                    }
                    var param_sub = param_list.join(', ');
                    var atr_sub = atr_list.join('\n');
                } else {
                    var param_sub = "";
                    var atr_sub = "";
                }
                
                if(rel[4] === "uml.Class"){
                    translate.push(
                    {
                        nameClass: source,
                        class_d: "public class " + source + " {",
                        const: "public " + source + " (" + param_sub + ") {" + 
                        "\n" +  atr_sub + "\n" +
                        "}",
                        atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                        meth_aso: "public void set"+source+"("+source + " " + source.toLowerCase() + ") {\n" +
                            "this."+source.toLowerCase()+" = "+source.toLowerCase()+"; // Asosiasi\n" +
                        "}\n" +
                        "public "+source+" get"+source+"() {\n" +
                            "return this."+source.toLowerCase()+";\n" +
                        "}\n",
                        param_ofSuper: source + " " + source.toLowerCase(),
                        asoClass: target,
                        atrConst_sub: [],
                        atr_sub: [],
                        meth_sub_aso: []
                    }
                    );
                }
                if(rel[4] === "uml.Abstract"){
                    translate.push(
                        {
                            nameClass: source,
                            class_d: "public abstract class " + source + " {",
                            const: "public " + source + " (" + param_sub + ") {" + 
                            "\n" +  atr_sub + "\n" +
                            "}",
                            atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                            meth_aso: "this." + source.toLowerCase() + " = " + source.toLowerCase() + ";",
                            param_ofSuper: source + " " + source.toLowerCase() + ";",
                            asoClass: target,
                            atrConst_sub: [],
                            atr_sub: [],
                            meth_sub_aso: []
                        }
                        );
                }
                if(rel[4] === "uml.Interface"){
                    translate.push(
                        {
                            nameClass: source,
                            class_d: "public interface " + source + " {",
                            const: "",
                            atr_ofSuper: "",
                            meth_aso: "",
                            param_ofSuper: "",
                            asoClass: target,
                            atrConst_sub: [],
                            atr_sub: [],
                            meth_sub_aso: [],
                            interface: true
                        }
                        );
                }
            }
        }
        return translate;
    }

    implement(rel){
        var translate = [];
        var tMeth_list = [];

        for(let i = 0; i < this.elements.length; i++){
            var target = rel[1];
            var target_type = rel[2];
            var source = rel[3];
            // superclass
            if(target_type === "uml.Interface"){
                if(target === this.elements[i].attributes.name){
                    var meth_target = this.elements[i].attributes.methods;
                    var meth_list = [];
                    for(let j = 0; j < meth_target.length; j++) {
                        var parts = meth_target[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        meth_list.push(variableType + " " + variableName + ";");
                        tMeth_list.push(variableType + " " + variableName);
                    }
                    var meth_super = meth_list.join(';\n');
                    translate.push({ 
                            nameClass: target,
                            imp: true,
                            class_d: "public interface " + target + " {",
                            class_m: meth_super,
                            meth_sub_aso: [],
                    });
                }
                for(let x = 0; x < this.elements.length; x++){
                    // subclass
                    if(source === this.elements[x].attributes.name){
                        var param_list = [];
                        var atr_list = [];
                        var sAtr_target = this.elements[x].attributes.attributes;
                        var atrName_sub = sAtr_target.map(function(item) {
                                var parts = item.split(":");
                                var substringValue = parts[0].trim().substring(1);
                                return substringValue;
                            });
                        if(sAtr_target[0] !== ''){
                            for(let j = 0; j < sAtr_target.length; j++) {
                                var parts = sAtr_target[j].split(":");
                                var variableType = parts[1].trim();
                                var variableName = parts[0].substring(1).trim();
                                var updatedString = variableType + " " + variableName;
                                param_list.push(updatedString);
                                atr_list.push("this." + atrName_sub[j] + " = " + atrName_sub[j] + ";");
                            }
                            var param_sub = param_list.join(', ');
                            var atr_sub = atr_list.join('\n');
                        } else {
                            var param_sub = "";
                            var atr_sub = "";
                        }
                        var meth_source = this.elements[x].attributes.methods;
                        var sMeth_list = [];
                        for(let j = 0; j < meth_source.length; j++) {
                            var parts = meth_source[j].split(":");
                            var variableType = parts[1].trim();
                            var variableName = parts[0].substring(1).trim();
                            var updatedString = "public " + variableType + " " + variableName + " {\n\n}";
                            sMeth_list.push(updatedString);
                        }
                        var meth_sub = sMeth_list.join('\n');
                        var meth_super_list = [];
                        for(let j = 0; j < tMeth_list.length; j++){
                            var meth = "public " + tMeth_list[j] + "{\n\n}";
                            meth_super_list.push("@Override", meth);
                        }
                        var meth_super = meth_super_list.join('\n');
                        if(rel[4] === "uml.Class"){
                            translate.push({ 
                                impClass: target,
                                nameClass: source,
                                class_d: "public class " + source + " implements " + target + " {\n",
                                const: "public " + source,
                                param: param_sub,
                                class_m_super: meth_super,
                                class_m: meth_sub,
                                atrConst_sub: [],
                                atr_const: atr_sub,
                                atr_sub: [],
                                param_sub: [],
                                meth_sub_aso: []
                            });
                        }
                        if(rel[4] === "uml.Abstract"){
                            translate.push({ 
                                impClass: target,
                                nameClass: source,
                                class_d: "public abstract class " + source + " implements " + target + " {\n",
                                class_m_super: meth_super,
                                class_m: meth_sub,
                                atrConst_sub: [],
                                atr_const: "",
                                atr_sub: [],
                                const: "",
                                param: "",
                                param_sub: [],
                                meth_sub_aso: []
                            });
                        }
                        if(rel[4] === "uml.Interface"){
                            alert("Translation failed! Interface class cannot implements other interfaces");
                        }
                    }
                }
            } else {
                alert("Translation failed! The superclass must be interface class");
            }
        }
        return translate;
    }

    depend(rel){
        var translate = [];

        for(let i = 0; i < this.elements.length; i++){
            var target = rel[1];
            var target_type = rel[2];
            var source = rel[3];
            // superclass
            if(target === this.elements[i].attributes.name){
                var meth_target = this.elements[i].attributes.methods;
                var meth_list = [];
                var meth_name = [];
                for(let j = 0; j < meth_target.length; j++) {
                    var parts = meth_target[j].split(":");
                    var variableType = parts[1].trim();
                    var variableName = parts[0].substring(1).trim();
                    meth_list.push(variableType + " " + variableName + ";");
                    meth_name.push(variableName);
                }
                var meth_super = meth_list.join(';\n');
                translate.push({ 
                        nameClass: target,
                        dep: true,
                        atr_ofSuper: "private " + target + " " + target.toLowerCase() + ";",
                        param_ofSub: target + " " + target.toLowerCase(),
                        atrConst_sub: "this." + target.toLowerCase() + " = " + target.toLowerCase(),
                        class_d: "public interface " + target + " {",
                        class_m: meth_super,
                        meth_sub_aso: [],
                });
                // subclass
                for(let x = 0; x < this.elements.length; x++){
                    if(source === this.elements[x].attributes.name){
                        var param_list = [];
                        var atr_list = [];
                        var sAtr_target = this.elements[x].attributes.attributes;
                        var atrName_sub = sAtr_target.map(function(item) {
                                var parts = item.split(":");
                                var substringValue = parts[0].trim().substring(1);
                                return substringValue;
                            });
                        if(sAtr_target[0] !== ''){
                            for(let j = 0; j < sAtr_target.length; j++) {
                                var parts = sAtr_target[j].split(":");
                                var variableType = parts[1].trim();
                                var variableName = parts[0].substring(1).trim();
                                var updatedString = variableType + " " + variableName;
                                param_list.push(updatedString);
                                atr_list.push("this." + atrName_sub[j] + " = " + atrName_sub[j] + ";");
                            }
                            var param_sub = param_list.join(', ');
                            var atr_sub = atr_list.join('\n');
                        } else {
                            var param_sub = "";
                            var atr_sub = "";
                        }
                        var meth_source = this.elements[x].attributes.methods;
                        var sMeth_list = [];
                        for(let j = 0; j < meth_source.length; j++) {
                            var parts = meth_source[j].split(":");
                            var variableType = parts[1].trim();
                            var variableName = parts[0].substring(1).trim();
                            var updatedString = "public " + variableType + " " + variableName + " {\n\n}";
                            sMeth_list.push(updatedString);
                        }
                        var meth_sub = sMeth_list.join('\n');
                        var meth_super_list = [];
                        for(let j = 0; j < meth_name.length; j++){
                            var meth = "public void do" + meth_name[j] + "{\n" +
                            "this." + target.toLowerCase() + "." + meth_name[j] + "; // Dependensi\n}";
                            meth_super_list.push(meth);
                        }
                        if(rel[4] === "uml.Class"){
                            translate.push({ 
                                depClass: target,
                                nameClass: source,
                                class_d: "public class " + source + " {\n",
                                const: "public " + source,
                                param: param_sub,
                                class_m_super: meth_super_list,
                                class_m: meth_sub,
                                atrConst_sub: [],
                                atr_const: atr_sub,
                                atr_sub: [],
                                param_sub: [],
                                meth_sub_aso: []
                            });
                        }
                        if(rel[4] === "uml.Abstract"){
                            translate.push({ 
                                depClass: target,
                                nameClass: source,
                                class_d: "public abstract class " + source + " {\n",
                                const: "public " + source,
                                param: param_sub,
                                class_m_super: meth_super_list,
                                class_m: meth_sub,
                                atrConst_sub: [],
                                atr_const: atr_sub,
                                atr_sub: [],
                                param_sub: [],
                                meth_sub_aso: []
                            });
                        }
                        if(rel[4] === "uml.Interface"){
                            translate.push({ 
                                nameClass: source,
                                depClass: target,
                                atr_ofSuper: "private " + source + " " + source.toLowerCase() + ";",
                                param_ofSub: source + " " + source.toLowerCase(),
                                atrConst_sub: "this." + source.toLowerCase() + " = " + source.toLowerCase(),
                                class_d: "public interface " + source + " {\n",
                                class_m: meth_super,
                                meth_sub_aso: [],
                        });
                        }
                    }
                }
            }
            // if(target_type === "uml.Interface"){
                
            // } else {
            //     alert("Translation failed! The superclass must be interface class");
            // }
        }
        return translate;
    }

    single(el) {
        var translate = [];

        for(let i = 0; i < this.elements.length; i++){
            var el_curr_name = this.elements[i].attributes.name;
            if(el === el_curr_name){
                var name = this.elements[i].attributes.name;
                var type = this.elements[i].attributes.type;
                var atr = this.elements[i].attributes.attributes;
                var atr_list = [];
                var param_list = [];

                if(type === "uml.Class") {
                    var class_decl = "public class " + name + " {\n";
                }
                if(type === "uml.Abstract") {
                    var class_decl = "public abstract class " + name + " {\n";
                }
                if(type === "uml.Interface") {
                    var class_decl = "public interface " + name + " {\n";
                }

                if(atr[0] !== ''){
                    var atr_name = atr.map(function(item) {
                        var parts = item.split(":");
                        var substringValue = parts[0].trim().substring(1);
                        return substringValue;
                    });
                    for(let j = 0; j < atr.length; j++) {
                        var parts = atr[j].split(":");
                        var variableType = parts[1].trim();
                        var variableName = parts[0].substring(1).trim();
                        var updatedString = variableType + " " + variableName;
                        param_list.push(updatedString);
                        atr_list.push("this." + atr_name[j] + " = " + atr_name[j] + ";");
                    }
                    var param = param_list.join(', ');
                    var atr_const = atr_list.join('\n');
                } else {
                    var param = "";
                    var atr_const = "";
                }
                
                var const_c = "public " + name + " (" + param + ") {\n" + atr_const + "\n}";

                translate.push({
                    nameClass: name,
                    class_d: class_decl,
                    const: const_c
                });
            }
        }
        return translate;
    }
    
    translate_namaClass(){
        var full_list = this.getRelation();
        var target_arr = [];
        var source_arr = [];
        for(let i = 0; i < full_list.length; i++){
            target_arr.push(full_list[i][1]);
            source_arr.push(full_list[i][3]);
        }
        const buyut = target_arr.filter(item => !source_arr.includes(item));

        // mulai translate - deklarasi class
        var n_class_rel = [];

        for(let i = 0; i < full_list.length; i++){
            var rel_curr = full_list[i];
            if (Array.isArray(rel_curr)) {
                if(rel_curr[0] === "uml.Generalization"){
                    n_class_rel.push(this.general(rel_curr));
                }
                if(rel_curr[0] === "uml.Implementation"){
                    n_class_rel.push(this.implement(rel_curr));
                }
                if(rel_curr[0] === "uml.Aggregation"){
                    n_class_rel.push(this.agregation(rel_curr));
                }
                if(rel_curr[0] === "uml.Dependency" || rel_curr[0] === "uml.Dependency2"){
                    n_class_rel.push(this.depend(rel_curr));
                }
                if(rel_curr[0] === "uml.Composition"){
                    n_class_rel.push(this.composit(rel_curr));
                }
                if(rel_curr[0] === "uml.Association"){
                    n_class_rel.push(this.asosi(rel_curr));
                }
            } else {
                n_class_rel.push(this.single(rel_curr));
            }
        }

        for (var i = 0; i < n_class_rel.length; i++) {
            if(n_class_rel[i].length > 1){
                var obj = n_class_rel[i][1];
              if (buyut.includes(obj.superClass)) {
                obj.gchild = 'true';
                }
            }
          }
        return n_class_rel;
    }

    translate_atrClass(){
        var classAtr = [];
        var classAtr_list = [];
        for(let i = 0; i < this.elements.length; i++){
            var atr_curr = this.elements[i].attributes.attributes;
            for(let j = 0; j < atr_curr.length; j++){
                if(atr_curr[j]){
                    // tipe data
                    var atrT = atr_curr[j].split(": ").pop();
                    // nama variabel
                    var atrN = atr_curr[j].substring(1, atr_curr[j].indexOf(':'));
                    // modifier
                    if(atr_curr[j].charAt(0) === "+"){
                        var atrM = "public ";
                    }
                    if(atr_curr[j].charAt(0) === "-"){
                        var atrM = "private ";
                    }
                    if(atr_curr[j].charAt(0) === "#"){
                        var atrM = "protected ";
                    }
                    classAtr.push(atrM + atrT + " " + atrN + ";");
                } else {
                    break;
                }
            }
            classAtr_list.push({
                nameClass: this.elements[i].attributes.name,
                atr: classAtr.join('\n'),
                list_atr: atr_curr
            });
            classAtr = [];
        }
        return classAtr_list;
    }

    translate_methClass(){
        var classMeth = [];
        var classMeth_list = [];
        for(let i = 0; i < this.elements.length; i++){
            var meth_curr = this.elements[i].attributes.methods;
            var atr_curr = this.elements[i].attributes.attributes; // Buat getter
            var class_curr_type = this.elements[i].attributes.type;
            if(class_curr_type === "uml.Interface"){
                for(let j = 0; j < meth_curr.length; j++){
                    if(meth_curr[j]){
                        var methT = meth_curr[j].split(": ").pop();
                        var methN = meth_curr[j].substring(1, meth_curr[j].indexOf(':'));
                        if(meth_curr[j].charAt(0) === "+"){
                            var atrM = "public ";
                        }
                        if(meth_curr[j].charAt(0) === "-"){
                            var atrM = "private ";
                        }
                        if(meth_curr[j].charAt(0) === "#"){
                            var atrM = "protected ";
                        }
                        classMeth.push(atrM + methT + " " + methN + ";\n");
                    } else {
                        break;
                    }
                }
            } else if(class_curr_type === "uml.Abstract"){
                for(let j = 0; j < meth_curr.length; j++){
                    if(meth_curr[j]){
                        var methT = meth_curr[j].split(": ").pop();
                        var methN = meth_curr[j].substring(1, meth_curr[j].indexOf(':'));
                        if(meth_curr[j].charAt(0) === "+"){
                            var atrM = "abstract public ";
                        }
                        if(meth_curr[j].charAt(0) === "-"){
                            var atrM = "abstract private ";
                        }
                        if(meth_curr[j].charAt(0) === "#"){
                            var atrM = "abstract protected ";
                        }
                        classMeth.push(atrM + methT + " " + methN + ";\n");
                    } else {
                        break;
                    }
                }
            } else {
                for(let j = 0; j < meth_curr.length; j++){
                    if(meth_curr[j]){
                        var methT = meth_curr[j].split(": ").pop();
                        var methN = meth_curr[j].substring(1, meth_curr[j].indexOf(':'));
                        if(meth_curr[j].charAt(0) === "+"){
                            var atrM = "public ";
                        }
                        if(meth_curr[j].charAt(0) === "-"){
                            var atrM = "private ";
                        }
                        if(meth_curr[j].charAt(0) === "#"){
                            var atrM = "protected ";
                        }
                        classMeth.push(atrM + methT + " " + methN + " {\n\n}\n");
                    } else {
                        break;
                    }
                }
            }
            for(let j = 0; j < atr_curr.length; j++){
                var atr = atr_curr[j];
                if(atr) {
                    var symbolIndex = atr.indexOf(":"); // Mencari posisi awal simbol ":"
                    var name = atr.substring(1, symbolIndex).trim(); // Memotong string setelah simbol "-" hingga sebelum simbol ":" dan menghapus spasi di sekitarnya
                    var type = atr.slice(symbolIndex + 1).trim(); // Memotong string setelah simbol ":" dan menghapus spasi di sekitarnya
                    var getter = "public " + type + " get" + name + "() {\n" +
                                    "return this." + name + ";\n}\n"; // Menggabungkan tipe dan nama dengan tanda "()"
                    var setter = "public void set" + name + "(" + type + " " + name + ") {\n" +
                                    "this." + name + " = " + name + ";\n}";
                    classMeth.push(setter, getter);
                } else {
                    continue;
                }
            }
            classMeth_list.push({
                nameClass: this.elements[i].attributes.name,
                meth: classMeth.join('\n')
            });
            classMeth = [];
        }
        return classMeth_list;
    }

    getTranslate() {
        var class_list = this.translate_namaClass();
        var atr_list = this.translate_atrClass();
        var meth_list = this.translate_methClass();
        // Dibagi jadi masing-masing kelas karena ada duplikat
        var result = {};
        for (var i = 0; i < class_list.length; i++) {
            if(class_list[i].length > 1){
                for (var j = 0; j < class_list[i].length; j++) {
                    var obj = class_list[i][j];
                    var nameClass = obj.nameClass;
                    if (!result[nameClass]) {
                        result[nameClass] = [];
                    }
                        result[nameClass].push(obj);
                }
            } else {
                var obj = class_list[i][0];
                var nameClass = obj.nameClass;
                if (!result[nameClass]) {
                    result[nameClass] = [];
                }
                    result[nameClass].push(obj);
            }
        }
        console.log('result', result);

        // Diambil yang class declaration-nya punya kata "extends"
        var kataKunci = "extends"; // Kata kunci yang ingin dicari
        var filteredResult = {};
        for (var key in result) {
            var arr = result[key]; // Mendapatkan array terkait dengan kunci
            for (var i = 0; i < arr.length; i++) {
                var compClass = arr[i];
                if (compClass.hasOwnProperty("comp")) {
                    for (var j = 0; j < arr.length; j++) {
                        var aggClass = arr[j];
                        if (aggClass.hasOwnProperty("agg")) {
                            var agg = aggClass.agg;
                            compClass.agg = agg;
                        }
                    }
                }
            }
            var filteredArray = result[key].filter(function(obj) {
                return obj.class_d.includes(kataKunci);
            });
            var filteredArray2 = result[key].filter(function(obj) {
                return Object.values(obj).some((value) => value === true);
            });

            if(filteredArray.length > 0 || filteredArray2.length > 0){
                for (var i = 0; i < arr.length; i++) {
                    if(arr[i].class_d.includes("implements")){
                        filteredArray2[0].class_d = arr[i].class_d;
                        filteredArray2[0].class_m_super = arr[i].class_m_super;
                        for(var j = 0; j < arr.length; j++){
                            if(arr[j].hasOwnProperty("agg")){
                                filteredArray2[0].agg = arr[j].agg;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("comp")){
                                filteredArray2[0].comp = arr[j].comp;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("dep")){
                                filteredArray2[0].dep = arr[j].dep;
                            }
                            if(arr[j].hasOwnProperty("aggClass")){
                                filteredArray2[0].aggClass = arr[j].aggClass;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("compClass")){
                                filteredArray2[0].compClass = arr[j].compClass;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("asoClass")){
                                filteredArray2[0].asoClass = arr[j].asoClass;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].meth_aso = arr[j].meth_aso;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("depClass")){
                                filteredArray2[0].depClass = arr[j].depClass;
                                filteredArray2[0].class_m_super = arr[j].class_m_super;
                            }
                        }
                    }
                    if(arr[i].class_d.includes("extends")){
                        for(var j = 0; j < arr.length; j++){
                            if(arr[j].hasOwnProperty("agg")){
                                filteredArray2[0].agg = arr[j].agg;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("comp")){
                                filteredArray2[0].comp = arr[j].comp;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("aso")){
                                filteredArray2[0].aso = arr[j].aso;
                            }
                            if(arr[j].hasOwnProperty("dep")){
                                filteredArray2[0].dep = arr[j].dep;
                            }
                            if(arr[j].hasOwnProperty("aggClass")){
                                filteredArray2[0].aggClass = arr[j].aggClass;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                            }
                            if(arr[j].hasOwnProperty("compClass")){
                                filteredArray2[0].compClass = arr[j].compClass;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                                filteredArray2[0].const = arr[j].const;
                            }
                            if(arr[j].hasOwnProperty("asoClass")){
                                filteredArray2[0].asoClass = arr[j].asoClass;
                                filteredArray2[0].atr_ofSuper = arr[j].atr_ofSuper;
                                filteredArray2[0].atrConst_ofSuper = arr[j].atrConst_ofSuper;
                                filteredArray2[0].param_ofSuper = arr[j].param_ofSuper;
                                filteredArray2[0].meth_aso = arr[j].meth_aso;
                                filteredArray2[0].meth_sub_aso = arr[j].meth_sub_aso;
                            }
                            if(arr[j].hasOwnProperty("depClass")){
                                filteredArray2[0].depClass = arr[j].depClass;
                                filteredArray2[0].class_m_super = arr[j].class_m_super;
                            }
                        }
                    }
                    if(arr[i].hasOwnProperty("aggClass")){
                        filteredArray2[0].aggClass = arr[i].aggClass;
                        filteredArray2[0].atr_ofSuper = arr[i].atr_ofSuper;
                        filteredArray2[0].atrConst_ofSuper = arr[i].atrConst_ofSuper;
                        filteredArray2[0].param_ofSuper = arr[i].param_ofSuper;
                    }
                    if(arr[i].hasOwnProperty("compClass")){
                        filteredArray2[0].compClass = arr[i].compClass;
                        filteredArray2[0].atr_ofSuper = arr[i].atr_ofSuper;
                        filteredArray2[0].atrConst_ofSuper = arr[i].atrConst_ofSuper;
                        filteredArray2[0].const_noParam = arr[i].const_noParam;
                        filteredArray2[0].const = arr[i].const;
                    }
                    if(arr[i].hasOwnProperty("asoClass")){
                        filteredArray2[0].asoClass = arr[i].asoClass;
                        filteredArray2[0].atr_ofSuper = arr[i].atr_ofSuper;
                        filteredArray2[0].atrConst_ofSuper = arr[i].atrConst_ofSuper;
                        filteredArray2[0].param_ofSuper = arr[i].param_ofSuper;
                        filteredArray2[0].meth_aso = arr[i].meth_aso;
                        filteredArray2[0].meth_sub_aso = arr[i].meth_sub_aso;
                    }
                    if(arr[i].hasOwnProperty("depClass")){
                        filteredArray2[0].depClass = arr[i].depClass;
                        filteredArray2[0].class_m_super = arr[i].class_m_super;
                    }
                }
            }
          
            if (filteredArray.length > 0) {
                filteredResult[key] = filteredArray;
            } else if (filteredArray2.length > 0) {
                filteredResult[key] = filteredArray2;
            } else {
                filteredResult[key] = result[key];
            }
            
        }

        // Diubah jadi bukan array lagi
        for (var key in filteredResult) {
            filteredResult[key] = filteredResult[key][0];
        }

        // Diurutin pake yang punya hubungan pertama sama grandparent
        var objekNames = Object.keys(filteredResult);
        objekNames.sort(function(a, b) {
        if (filteredResult[a].hasOwnProperty("gchild")) {
            return -1; // Objek dengan properti "buyut" diutamakan di awal
        } else if (filteredResult[b].hasOwnProperty("gchild")) {
            return 1;
        } else {
            return 0;
        }
        });

        console.log('filteredResult', filteredResult);
        
        var renewedTranslate = {};
        for (var i = 0; i < objekNames.length; i++) {
            var objekName = objekNames[i];
            var objek = filteredResult[objekName];
            if(objek.hasOwnProperty("superClass")){
                var superClass = objek.superClass;
                var superKey_fromSub = objek.super;
                var param_fromSub = objek.param;
                //var atr_fromSub = objek.atr_const;

                if (filteredResult.hasOwnProperty(superClass)) {
                    var superObj = filteredResult[superClass];
                    var superKey_fromSuper = superObj.super;
                    var param_fromSuper = superObj.param;
                    //var atr_fromSuper = superObj.atr_const;
    
                    var new_super = superKey_fromSuper + "," + superKey_fromSub;
                    var new_param = param_fromSuper + ", " + param_fromSub;
                    //var new_atr = atr_fromSuper + "\n" + atr_fromSub;
                }
                objek.super = new_super;
                objek.param = new_param;
                //objek.atr_const = new_atr;
            }
            if(objek.hasOwnProperty("aggClass")){
                var aggClass = objek.aggClass;
                var atr_ofSuper = objek.atr_ofSuper;
                var atrConst_ofSuper = objek.atrConst_ofSuper;
                var param_ofSuper = objek.param_ofSuper;
                if (filteredResult.hasOwnProperty(aggClass)) {
                    var superObj = filteredResult[aggClass];
                    var atr_sub = superObj.atr_sub;
                    var atrConst_sub = superObj.atrConst_sub;
                    var param_sub = superObj.param_sub;
                    atr_sub.push(atr_ofSuper);
                    atrConst_sub.push(atrConst_ofSuper);
                    param_sub.push(param_ofSuper);
                }
            }
            if(objek.hasOwnProperty("compClass")){
                var compClass = objek.compClass;
                var atr_ofSuper = objek.atr_ofSuper;
                var atrConst_ofSuper = objek.atrConst_ofSuper;
                if (filteredResult.hasOwnProperty(compClass)) {
                    var superObj = filteredResult[compClass];
                    var atr_sub = superObj.atr_sub;
                    var atrConst_sub = superObj.atrConst_sub;
                    atr_sub.push(atr_ofSuper);
                    atrConst_sub.push(atrConst_ofSuper);
                }
            }
            if(objek.hasOwnProperty("asoClass")){
                var asoClass = objek.asoClass;
                var atr_ofSuper = objek.atr_ofSuper;
                var meth_aso = objek.meth_aso;
                if (filteredResult.hasOwnProperty(asoClass)) {
                    var superObj = filteredResult[asoClass];
                    var atr_sub = superObj.atr_sub;
                    var meth_sub_aso = superObj.meth_sub_aso;
                    atr_sub.push(atr_ofSuper);
                    meth_sub_aso.push(meth_aso);
                }
            }
            if(objek.hasOwnProperty("depClass")){
                var depClass = objek.depClass;
                var atrConst_sub1 = objek.atrConst_sub;
                var atr_sub = objek.atr_sub;
                var param_sub = objek.param_sub;
                if (filteredResult.hasOwnProperty(depClass)) {
                    var superObj = filteredResult[depClass];
                    var atrConst_sub = superObj.atrConst_sub;
                    var atr_ofSuper = superObj.atr_ofSuper;
                    var param_ofSub = superObj.param_ofSub;
                    atr_sub.push(atr_ofSuper);
                    atrConst_sub1.push(atrConst_sub);
                    param_sub.push(param_ofSub);
                }
            }
            renewedTranslate[objekName] = objek;
        }

        // Satuin list atribut sama list method
        for (var i = 0; i < atr_list.length; i++) {
            var atrObj = atr_list[i];
            var methObj = meth_list[i];
            var nameClass = atrObj.nameClass;
          
            if (renewedTranslate.hasOwnProperty(nameClass)) {
                renewedTranslate[nameClass].atrs = atrObj.atr;
                if(renewedTranslate[nameClass].hasOwnProperty("meths")){
                    var meths = renewedTranslate[nameClass].meths;
                    var methsCopy = [...meths];
                    methsCopy.push(methObj.meth);
                    renewedTranslate[nameClass].meths = methsCopy.join('\n');
                } else {
                    renewedTranslate[nameClass].meths = methObj.meth;
                }
            }
        }

        // Rapihin super
        var atr_list_super = this.translate_atrClass();
        for(var key in renewedTranslate){
            if(renewedTranslate[key].hasOwnProperty("gchild") || renewedTranslate[key].hasOwnProperty("ggchild")){
                var nameClass = renewedTranslate[key].nameClass;
                var super_atr = renewedTranslate[key].super;
                for(let i = 0; i < atr_list_super.length; i++){
                    var nameClassAtr = atr_list_super[i].nameClass;
                    var list_atr = atr_list_super[i].list_atr;
                    if(nameClass === nameClassAtr) {
                        var arr_of_super = super_atr.split(",");
                        var atr_leng = list_atr.length;
                        for(let j = 0; j < atr_leng; j++){
                            arr_of_super.pop();
                        }
                        renewedTranslate[key].super = arr_of_super.join(",");
                    }
                }
            }
        }
        console.log('renewedTranslate', renewedTranslate);
        return renewedTranslate;
    }

    generateData() {
        var zip = new JSZip();
        var getTranslate = this.getTranslate();
        
        for (var key in getTranslate) {
            var nameClass = getTranslate[key].nameClass + ".java";
            var class_d = getTranslate[key].class_d;
            var atrs = getTranslate[key].atrs;
            if(getTranslate[key].atr_sub) {
                if(Array.isArray(getTranslate[key].atr_sub)){
                    var atrs_sub = getTranslate[key].atr_sub.join('\n');
                } else {
                    var atrs_sub = getTranslate[key].atr_sub;
                }
            } else {
                var atrs_sub = "";
            }
            var const_d = getTranslate[key].const;
            var const_noParam = getTranslate[key].const_noParam;
            var param = getTranslate[key].param;
            if(getTranslate[key].param_sub) {
                if(Array.isArray(getTranslate[key].param_sub)){
                    var param_sub = getTranslate[key].param_sub.join(', ');
                } else {
                    var param_sub = getTranslate[key].param_sub;
                }
            } else {
                var param_sub = "";
            }
            var super_atrs = getTranslate[key].super;
            var atrConst_sub = getTranslate[key].atrConst_sub;
            if(getTranslate[key].atrConst_sub) {
                if(Array.isArray(getTranslate[key].atrConst_sub)){
                    var atrConst_sub = getTranslate[key].atrConst_sub.join('\n');
                } else {
                    var atrConst_sub = getTranslate[key].atrConst_sub;
                }
            } else {
                var atrConst_sub = "";
            }
            var atr_const = getTranslate[key].atr_const;
            if(getTranslate[key].meth_sub_aso){
                if(Array.isArray(getTranslate[key].meth_sub_aso)){
                    var meth_sub_aso = getTranslate[key].meth_sub_aso.join('\n');
                } else {
                    var meth_sub_aso = getTranslate[key].meth_sub_aso;
                }
                
            } else {
                var meth_sub_aso = "";
            }
            if(getTranslate[key].class_m_super){
                if(Array.isArray(getTranslate[key].class_m_super)){
                    var class_m_super = getTranslate[key].class_m_super.join('\n');
                } else {
                    var class_m_super = getTranslate[key].class_m_super;
                }
            } else {
                var class_m_super = "";
            }
            var meths = getTranslate[key].meths;
            if(getTranslate[key].hasOwnProperty("granny")){
                var translate = 
                    class_d + "\n\n" +
                    atrs + "\n" +
                    const_d + "(" + param + ") {\n" +
                    atr_const + "\n}\n\n" +
                    meth_sub_aso + "\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass,translate);
            } else if(getTranslate[key].hasOwnProperty("gchild") || getTranslate[key].hasOwnProperty("ggchild")) {
                var translate = 
                    class_d + "\n\n" + 
                    atrs + "\n" + atrs_sub + "\n\n" +
                    const_d + "(" +param_sub+ ", " + param + ") {\n" +
                    "super(" + super_atrs + ");\n" +
                    atrConst_sub + "\n" +
                    atr_const + "\n}\n\n" +
                    meth_sub_aso + "\n" +
                    class_m_super + "\n" +
                    meths + "\n}"
                    zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("agg")) {
                var translate = 
                    class_d + "\n\n" + 
                    atrs + "\n" + atrs_sub + "\n\n" +
                    const_d + "(" +param_sub+", "+ param + ") {\n" +
                    atrConst_sub + "\n" +
                    atr_const + "\n}\n\n" +
                    meth_sub_aso + "\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass, translate);
            // } else if(getTranslate[key].hasOwnProperty("aggClass")) {
            //     var translate = 
            //         class_d + "\n\n" + 
            //         atrs + "\n" + atrs_sub.join('\n') + "\n\n" +
            //         const_d + "\n\n" +
            //         meths + "\n}";
            //         zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("comp")) {
                var translate = 
                    class_d + "\n\n" + 
                    atrs + "\n" + atrs_sub + "\n\n" +
                    const_d + "(" + param_sub + ", " + param +") {\n" +
                    atrConst_sub + "\n" +
                    atr_const + "\n}\n\n" +
                    meth_sub_aso + "\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("compClass")) {
                var translate = 
                    class_d + "\n\n" + 
                    atrs + "\n" + atrs_sub + "\n" +
                    const_noParam + "\n\n" +
                    const_d  +
                    meth_sub_aso + "\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("aso")) {
                var translate = 
                    class_d + "\n\n" + 
                    atrs + "\n" + atrs_sub + "\n\n" +
                    const_d + " (" + param + ') {\n' +
                    atr_const + "\n" +
                    atrConst_sub + "}\n\n" +
                    meth_sub_aso + "\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass, translate);
            // } else if(getTranslate[key].hasOwnProperty("asoClass")) {
            //     var translate = 
            //         class_d + "\n\n" + 
            //         atrs + "\n" + atrs_sub.join('\n') + "\n" +
            //         const_d + "\n\n" +
            //         meths + "\n}";
            //         zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("imp") || getTranslate[key].hasOwnProperty("dep") || getTranslate[key].hasOwnProperty("interface")) {
                var translate = 
                    class_d + "\n\n" + 
                    meths + "\n}";
                    zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("impClass")) {
                var translate = 
                    class_d + "\n\n" + 
                    const_d + " (" + param + ") {\n" +
                    atr_const + "\n}\n\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass, translate);
            } else if(getTranslate[key].hasOwnProperty("depClass")) {
                var translate = 
                    class_d + "\n\n" + 
                    atrs_sub + "\n\n" + 
                    const_d + " (" + param + ") {\n" +
                    atr_const + "\n}\n\n" +
                    class_m_super + "\n" +
                    meths + "\n}";
                    zip.file(nameClass, translate);
            } else {
                var translate = 
                class_d + "\n\n" + 
                atrs + "\n\n" +
                const_d + "\n" +
                meths + "\n}";
                zip.file(nameClass, translate);
            }
            console.log(translate);
        }
        zip.file("readme.txt", "Mohon luluskan saya, pak/bu. Saya udah ga kuat :(");
        zip.generateAsync({type:"base64"}).then(function (content) {
            var link = document.createElement('a');
            link.href = "data:application/zip;base64," + content;
            link.download = "ClodeTranslation.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
}
////////////////////////////////// End of OOP

///////////////////////////////// jointjs thingy
var namespace = joint.shapes;
const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
var paper = new joint.dia.Paper({
    el: document.getElementById('myholder'),
    model: graph,
    width: 1338,
    height: 1338,
    gridSize: 10,
    drawGrid: true,
    background: {
        color: 'rgb(218, 208, 194)'
    },
    defaultConnectionPoint: {
        name: 'boundary',
        args: {
        selector: false
        }
    },
    cellViewNamespace: namespace,
    async: true,
    sorting: joint.dia.Paper.sorting.APPROX,
    linkPinning: false,
    defaultLink: (elementView, magnet) => {
        return new joint.shapes.standard.Link({
        attrs: {
            line: {
            stroke: 'black'
            }
        }
        });
    },
    defaultConnectionPoint: function(endPathSegmentLine, endView, endMagnet) {
        return joint.connectionPoints.boundary.call(this, endPathSegmentLine, endView, endMagnet, {
           selector: endView.model.get('type') === 'uml.Class' ? 'root' : 'body'
         });
    }
});

var uml = joint.shapes.uml;
var boundaryTool = new joint.elementTools.Boundary();
var removeButton = new joint.elementTools.Remove();
var linkToolsView = new joint.linkTools.Connect({
            x: 'calc(w + 25)',
            y: 'calc(h/2)',
            magnet: (view) => { color = 'black'; return view.el },
            markup: joint.util.svg `
               <circle r="9" fill="red" />
            `
});
var infoButton = new joint.elementTools.Button({
    markup: 
    joint.util.svg `
    <svg id="changeColor" fill="#DC7633" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    width="34" zoomAndPan="magnify" viewBox="0 0 375 374.9999" height="34" preserveAspectRatio="xMidYMid meet" version="1.0">
    <defs><path id="pathAttribute" d="M 7.09375 7.09375 L 367.84375 7.09375 L 367.84375 367.84375 L 7.09375 367.84375 Z M 7.09375 7.09375 " fill="#ff006a"></path></defs>
    <g><path id="pathAttribute" d="M 187.46875 7.09375 C 87.851562 7.09375 7.09375 87.851562 7.09375 187.46875 C 7.09375 287.085938 87.851562 367.84375 187.46875 367.84375 C 287.085938 367.84375 367.84375 287.085938 367.84375 187.46875 C 367.84375 87.851562 287.085938 7.09375 187.46875 7.09375 " fill-opacity="1" fill-rule="nonzero" fill="#ff006a">
    </path></g><g id="inner-icon" transform="translate(85, 75)"> <svg xmlns="http://www.w3.org/2000/svg" width="231" height="231" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16" id="IconChangeColor"> 
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" id="mainIconPathAttribute"></path> 
    </svg> </g></svg>
    `
    ,
    x: '100%',
    y: '100%',
    offset: {
        x: 0,
        y: 0
    },
    rotate: true,
    action: function(evt) {
        var id = this.model.id;
        var el = graph.getCell(id);
        var el_name = el.attributes.name;
        var arr_atr = el.attributes.attributes;
        var arr_meth = el.attributes.methods;
        $(modalEdit).modal("show");

        editName.addEventListener('click', function() {
            $(modalEdit).modal("hide");
            $(edit_name).modal("show");
        });
        editAtr.addEventListener('click', function() {
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
            while (edit_list.childNodes.length > 0) {
                edit_list.removeChild(edit_list.lastChild);
            }
            $(modalEdit).modal("hide");
            $(edit).modal("show");
            arr_atr.forEach(function(value) {
                var input = document.createElement("input");
                input.type = "text";
                input.value = value;
                input.name = 'new_atribut[]';
                input.className = 'form-control';
                input.addEventListener('keydown', function(event) {
                    addInput(event, edit_list, 'new_atribut[]');
                });
                list.appendChild(input);
            });
        });
        editMeth.addEventListener('click', function() {
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
            while (edit_list.childNodes.length > 0) {
                edit_list.removeChild(edit_list.lastChild);
            }
            $(modalEdit).modal("hide");
            $(edit).modal("show");
            arr_meth.forEach(function(value) {
                var input = document.createElement("input");
                input.type = "text";
                input.value = value;
                input.name = 'new_method[]';
                input.className = 'form-control';
                input.addEventListener('keydown', function(event) {
                    addInput(event, edit_list, 'new_method[]');
                });
                list.appendChild(input);
            });
        });
        saveData.addEventListener('click', function(){
            //Atribut
            var list_atribut = Array.prototype.slice.call(n_input_atr);
            atr = list_atribut.map((o) => o.value);

            //Method
            var list_method = Array.prototype.slice.call(n_input_meth);
            meth = list_method.map((o) => o.value);

            if(atr.length > 0){
                el.prop('attributes', atr);
            }
            if(meth.length > 0){
                el.prop('methods', meth);
            } 
        });
        saveName.addEventListener('click', function(){
            const n_input_name = document.getElementById('new_name').value;
            if(n_input_name){
                el.prop('name', n_input_name);
            }
        });
    }
});
var toolsView = new joint.dia.ToolsView({
    tools: [
        linkToolsView,
        boundaryTool,
        removeButton,
        infoButton
    ]
});
paper.on('element:mouseenter', function(elementView) {
    elementView.addTools(toolsView);
});
joint.shapes.standard.Link.define('uml.Association', {
    attrs: {
        line: {
            stroke: 'black',
            strokeWidth: 1,
            targetMarker: {
                'type': 'rect',
                'width': 1,
                'height': 1,
                'stroke': 'none'
            }
        }
    },
    defaultLabel: {
        markup: [
            {
                tagName: 'rect',
                selector: 'body'
            }, {
                tagName: 'text',
                selector: 'label'
            }
        ],
        attrs: {
            label: {
                fill: 'black', // default text color
                fontSize: 12,
                textAnchor: 'middle',
                yAlignment: 'middle',
                pointerEvents: 'none'
            },
            body: {
                ref: 'label',
                fill: 'white',
                stroke: 'cornflowerblue',
                strokeWidth: 2,
                width: 'calc(1.2*w)',
                height: 'calc(1.2*h)',
                x: 'calc(x-calc(0.1*w))',
                y: 'calc(y-calc(0.1*h))'
            }
        },
        position: {
            distance: 100, // default absolute position
            args: {
                absoluteDistance: true
            }
        }
    }
});
joint.shapes.standard.Link.define('uml.Dependency', {
    attrs: {
        line: {
            stroke: 'black',
            strokeWidth: 1,
            strokeDasharray:(Math.floor(Math.random() * 5) + 1) + ' ' + (Math.floor(Math.random() * 5) + 1),
            targetMarker: {
                markup: joint.util.svg `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/> </svg>
            `
            }
        }
    }
});
joint.shapes.standard.Link.define('uml.Dependency2', {
    attrs: {
        line: {
            stroke: 'black',
            strokeWidth: 1,
            strokeDasharray:(Math.floor(Math.random() * 5) + 1) + ' ' + (Math.floor(Math.random() * 5) + 1),
            sourceMarker: {
                markup: joint.util.svg `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/> </svg>
            `
            },
            targetMarker: {
                markup: joint.util.svg `
\
            `
            }
        }
    }
});
///////////////////////////////// end of jointjs thingy

//////////////////////////////// Import java classes

var storedArrayString = localStorage.getItem('classes');
var classes = JSON.parse(storedArrayString);

if(storedArrayString){
    const diagram = new Diagram(null, classes);
    diagram.translate_java();
}
//////////////////////////////// end of import java classes

/////////////////////////////// workspace
var clas = document.getElementById('class');
var abstract = document.getElementById('abstract');
var interface = document.getElementById('interface');

const terjemah = document.getElementById("download");
const ekspor = document.getElementById("image");
const simpan = document.getElementById("save");
const cek = document.getElementById("cek");

const input_atrM = document.getElementsByName('modifierAtribut1');
const input_atrTD = document.getElementsByName('atribut_td[]');
const input_atr = document.getElementsByName('atribut[]');
var tambah_atr = document.getElementById('tambah_atr');
tambah_atr.addEventListener('click', function() {
    let div = document.getElementById("inputs");
    addInput(div, 'atribut[]', 'atribut_td[]', 'modifierAtribut');
});

const input_methM = document.getElementsByName('modifierMethod1');
const input_methTD = document.getElementsByName('method_td[]');
const input_meth = document.getElementsByName('method[]');
var tambah_meth = document.getElementById('tambah_meth');
tambah_meth.addEventListener('click', function() {
    let div = document.getElementById("inputs2");
    addInput(div, 'method[]', 'method_td[]', 'modifierMethod');
});

const n_input_atr = document.getElementsByName('new_atribut[]');
const n_input_meth = document.getElementsByName('new_method[]');
var editName = document.getElementById("b_editName");
var editAtr = document.getElementById("b_editAtr");
var editMeth = document.getElementById("b_editMeth");
var modalEdit = document.getElementById("modalEdit");
var modalTrans = document.getElementById("d_tr");
var modalEks = document.getElementById("d_ex");
var edit = document.getElementById("edit");
var edit_name = document.getElementById("edit_name");
var list = document.getElementById("list");
var edit_list = document.getElementById("inputs3");
const saveData = document.getElementById("saveData");
const saveName = document.getElementById("saveNewName");

/////////////////////////////////// End of Workspace

function resetInputs() {
    const frm = document.getElementById("form-kelas");
    frm.reset();
    const frm2 = document.getElementById("form-atr");
    frm2.reset();
    const frm3 = document.getElementById("form-meth");
    frm3.reset();
    while (inputs.childNodes.length > 0) {
        inputs.removeChild(inputs.lastChild);
    }
    while (inputs2.childNodes.length > 0) {
        inputs2.removeChild(inputs2.lastChild);
    }
}

let counter_a = 1; // Inisialisasi counter di luar fungsi addInput
let counter_m = 1;
function addInput(div, name, nameTD, nameR) {
      const newInput = document.createElement("input");
      const newInputTD = document.createElement("input");
      const newInputBut = document.createElement("button");
      const hr = document.createElement("hr");
      const br = document.createElement("br");
      const br2 = document.createElement("br");
      const labIput = document.createElement("label");
      const labTD = document.createElement("label");
      const labRad = document.createElement("label");

      newInput.type = 'text';
      newInput.name = name;
      newInput.className = 'form-control';

      newInputTD.type = 'text';
      newInputTD.name = nameTD;
      newInputTD.className = 'form-control';

      newInputBut.type = 'button';
      newInputBut.className = 'btn btn-success tambah_atr';
      newInputBut.textContent = 'Tambah atribut';
      newInputBut.onclick = function(event) {
        addInput(div, name, nameTD, nameR);
      };

      div.appendChild(labRad);
      if(name === "atribut[]"){
        counter_a++;
        labIput.textContent = "Nama atribut:";
        labIput.setAttribute("for", name);
        labTD.textContent = "Tipe data:"
        labTD.setAttribute("for", nameTD);
        labRad.textContent = "Visibilitas: ";
        labRad.setAttribute("for", nameR);
        addRadio(div, 'public', 'Public', nameR, counter_a);
        addRadio(div, 'private', 'Private', nameR, counter_a);
        addRadio(div, 'protected', 'Protected', nameR, counter_a);
      }
      if(name === "method[]"){
        counter_m++;
        labIput.textContent = "Nama method:";
        labIput.setAttribute("for", name);
        labTD.textContent = "Return data:"
        labTD.setAttribute("for", nameTD);
        labRad.textContent = "Visibilitas: ";
        labRad.setAttribute("for", nameR);
        addRadio(div, 'public', 'Public', nameR, counter_m);
        addRadio(div, 'private', 'Private', nameR, counter_m);
        addRadio(div, 'protected', 'Protected', nameR, counter_m);
      }
      div.appendChild(br);
      div.appendChild(labIput);
      div.appendChild(newInput);
      div.appendChild(labTD);
      div.appendChild(newInputTD);
      div.appendChild(br2);
      div.appendChild(newInputBut);
    //   div.appendChild(br);
      div.appendChild(hr);
}

function addRadio(div, value, labelText, nameR, num) {
    // Buat elemen radio button
    const radioInput = document.createElement("input");
    radioInput.type = 'radio';
    radioInput.name = nameR + num;
    radioInput.value = value;
    radioInput.className = 'form-check-input';

    // Buat elemen label untuk radio button
    const label = document.createElement("label");
    label.className = 'form-check-label';
    label.innerHTML = labelText;

    // Buat elemen div untuk mengelompokkan radio button dan label
    const radioDiv = document.createElement("div");
    radioDiv.className = 'form-check form-check-inline';

    // Tambahkan radio button dan label ke dalam div radioDiv
    radioDiv.appendChild(radioInput);
    radioDiv.appendChild(label);

    // Tambahkan div radioDiv ke dalam div utama
    div.appendChild(radioDiv);
}
  
// tipe kelas
var tipeClass = "";
clas.onclick = function() {
    tipeClass = clas.value;
};
abstract.onclick = function() {
    tipeClass = abstract.value;
};
interface.onclick = function() {
    tipeClass = interface.value;
};
resetInputs();

// Bikin kelasnya
function nopal() {
    if(tipeClass === "interface"){
        const namaClassInterface = document.getElementById('nama_kelas_interface').value;
        var atr = [];
        var meths = [];
        var mod_m = [];
        for (i = 1; i <= counter_m; i++){
            const modif = document.getElementsByName('modifierMethod' + i);
            let cek = false;
            for (j = 0; j < modif.length; j++) {
                if (modif[j].checked){
                    cek = true;
                    mod_m.push(modif[j].value)
                }
            }
            if(!cek){
                mod_m.push("null")
            }
        }
        meths.push(mod_m);
        var list_method = Array.prototype.slice.call(input_meth);
        meth = list_method.map((o) => o.value);
        for(let i = 0; i < meth.length; i++){
            if(meth[i] === ""){
                meth[i] = "method()";
            }
            if(!meth[i].includes("(")){
                meth[i] = meth[i] + "()";
            }
        }
        meths.push(meth);
        var list_methTD = Array.prototype.slice.call(input_methTD);
        meth_TD = list_methTD.map((o) => o.value);
        for(let i = 0; i < meth_TD.length; i++){
            if(meth_TD[i] === ""){
                meth_TD[i] = "void";
            }
        }
        meths.push(meth_TD);

        const indexToRemove = meths[1].indexOf("method()"); // biar gabisa bikin method kalo ga ada nama
        if (indexToRemove !== -1) {
            meths[0].splice(indexToRemove, 1);
            meths[1].splice(indexToRemove, 1);
            meths[2].splice(indexToRemove, 1);
        }
        
        var list_meths = [];
        if(meths[1][0] !== ''){
            for (let i = 0; i < meths[1].length; i++) {
                if(meths[0][i] === "private"){
                    list_meths.push("-" + meths[1][i] + ': ' + meths[2][i]);
                } else if(meths[0][i] === "protected"){
                    list_meths.push("#" + meths[1][i] + ': ' + meths[2][i]);
                } else {
                    list_meths.push("+" + meths[1][i] + ': ' + meths[2][i]);
                }
            }
        }
        newClass(namaClassInterface, tipeClass, atr, list_meths);
        const frm = document.getElementById("form-interface");
        frm.reset();
        resetInputs();
    } else {
        //Kelas
        const namaClass = document.getElementById('nama_kelas').value;
        //Atribut
        var atrs = [];
        var mod = [];
        
        for (i = 1; i <= counter_a; i++){
            const modif = document.getElementsByName('modifierAtribut' + i);
            let cek = false;
            for (j = 0; j < modif.length; j++) {
                if (modif[j].checked){
                    cek = true;
                    mod.push(modif[j].value)
                }
            }
            if(!cek){
                mod.push("null")
            }
        }
        atrs.push(mod);
        var list_atribut = Array.prototype.slice.call(input_atr);
        atr = list_atribut.map((o) => o.value);
        for(let i = 0; i < atr.length; i++){
            if(atr[i] === ""){
                atr[i] = "atribut";
            }
        }
        atrs.push(atr);
        var list_atributTD = Array.prototype.slice.call(input_atrTD);
        atr_TD = list_atributTD.map((o) => o.value);
        for(let i = 0; i < atr_TD.length; i++){
            if(atr_TD[i] === ""){
                atr_TD[i] = "String";
            }
        }
        atrs.push(atr_TD);

        const indexToRemove = atrs[1].indexOf("atribut"); // biar gabisa bikin atribut kalo ga ada nama
        if (indexToRemove !== -1) {
            atrs[0].splice(indexToRemove, 1);
            atrs[1].splice(indexToRemove, 1);
            atrs[2].splice(indexToRemove, 1);
        }
        console.log(atrs)

        var list_atrs = [];
        if(atrs[1][0] !== ''){
            for (let i = 0; i < atrs[1].length; i++) {
                if(atrs[0][i] === "private"){
                    list_atrs.push("-" + atrs[1][i] + ': ' + atrs[2][i]);
                } else if(atrs[0][i] === "protected"){
                    list_atrs.push("#" + atrs[1][i] + ': ' + atrs[2][i]);
                } else {
                    list_atrs.push("+" + atrs[1][i] + ': ' + atrs[2][i]);
                }
            }
        }
        
        //Method
        var meths = [];
        var mod_m = [];
        for (i = 1; i <= counter_m; i++){
            const modif = document.getElementsByName('modifierMethod' + i);
            let cek = false;
            for (j = 0; j < modif.length; j++) {
                if (modif[j].checked){
                    cek = true;
                    mod_m.push(modif[j].value)
                }
            }
            if(!cek){
                mod_m.push("null")
            }
        }
        meths.push(mod_m);
        var list_method = Array.prototype.slice.call(input_meth);
        meth = list_method.map((o) => o.value);
        for(let i = 0; i < meth.length; i++){
            if(meth[i] === ""){
                meth[i] = "method()";
            }
            if(!meth[i].includes("(")){
                meth[i] = meth[i] + "()";
            }
        }
        meths.push(meth);
        var list_methTD = Array.prototype.slice.call(input_methTD);
        meth_TD = list_methTD.map((o) => o.value);
        for(let i = 0; i < meth_TD.length; i++){
            if(meth_TD[i] === ""){
                meth_TD[i] = "void";
            }
        }
        meths.push(meth_TD);
        
        const indexToRemove2 = meths[1].indexOf("method()"); // biar gabisa bikin method kalo ga ada nama
        if (indexToRemove2 !== -1) {
            meths[0].splice(indexToRemove2, 1);
            meths[1].splice(indexToRemove2, 1);
            meths[2].splice(indexToRemove2, 1);
        }
        var list_meths = [];
        if(meths[1][0] !== ''){
            for (let i = 0; i < meths[1].length; i++) {
                if(meths[0][i] === "private"){
                    list_meths.push("-" + meths[1][i] + ': ' + meths[2][i]);
                } else if(meths[0][i] === "protected"){
                    list_meths.push("#" + meths[1][i] + ': ' + meths[2][i]);
                } else {
                    list_meths.push("+" + meths[1][i] + ': ' + meths[2][i]);
                }
            }
        }

        newClass(namaClass, tipeClass, list_atrs, list_meths); //Bikin class diagram
        resetInputs(); // clear form
    }
}

function newClass(namaClass, tipeClass, atribut, method){
    localStorage.removeItem('classes'); //clear memory
    var classes = {};
    const namaClass_array = [];
    var tipeClass_array = [];
    namaClass_array.push(namaClass);

    if(tipeClass === 'interface'){
        tipeClass_array.push(
            new uml.Interface({
                position: { x:300  , y: 50 },
                size: { width: 240, height: 100 },
                name: namaClass,
                attributes: atribut,
                methods: method,
                attrs: {
                    '.uml-class-name-rect': {
                        fill: '#EE6983',
                        stroke: '#ffffff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-rect': {
                        fill: '#FFC4C4',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-methods-rect': {
                        fill: '#FFF5E4',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle'
                    }
                }
            })
        );
    }
    if(tipeClass === 'abstract'){
        tipeClass_array.push(
            new uml.Abstract({
                position: { x:300  , y: 300 },
                size: { width: 260, height: 100 },
                name: namaClass,
                attributes: atribut,
                methods: method,
                attrs: {
                    '.uml-class-name-rect': {
                        fill: '#D58BDD',
                        stroke: '#ffffff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-rect': {
                        fill: '#FF99D7',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-methods-rect': {
                        fill: '#FFE6F7',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-methods-text, .uml-class-attrs-text': {
                        fill: '#fff'
                    }
                }
            })
        );
    }
    if(tipeClass === 'class'){
        tipeClass_array.push(
            new uml.Class({
                position: { x:20  , y: 190 },
                size: { width: 220, height: 100 },
                name: namaClass,
                attributes: atribut,
                methods: method,
                attrs: {
                    '.uml-class-name-rect': {
                        fill: '#93B5C6',
                        stroke: '#fff',
                        'stroke-width': 0.5,
                    },
                    '.uml-class-attrs-rect': {
                        fill: '#E4D8DC',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-methods-rect': {
                        fill: '#FFE3E3',
                        stroke: '#fff',
                        'stroke-width': 0.5
                    },
                    '.uml-class-attrs-text': {
                        ref: '.uml-class-attrs-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle'
                    },
                    '.uml-class-methods-text': {
                        ref: '.uml-class-methods-rect',
                        'ref-y': 0.5,
                        'y-alignment': 'middle'
                    }
                }
            })
        );
    }
    namaClass_array.forEach((key, i) => classes[key] = tipeClass_array[i]);
    Object.keys(classes).forEach(function(key) {
        graph.addCell(classes[key]);
    });
    graph.getElements().forEach(function(el) {
    const size = (el.get('methods').length + el.get('attributes').length) * 20 + 30;
    el.resize(220, size);
});
    paper.setInteractivity({elementMove: true});
}

function relasi(type) {
    if(type === "Aso"){
        paper.options.defaultLink = (elementView, magnet) => {
            var link2 = new joint.shapes.uml.Association();
            link2.appendLabel({
                attrs: {
                    label: {
                        text: '>>>'
                    }
                }
            });
            return link2;
        }
    } else if(type === "Dep"){
        paper.options.defaultLink = (elementView, magnet) => {
            return new joint.shapes.uml.Dependency();
        }
    } else if(type === "Gen"){
        paper.options.defaultLink = (elementView, magnet) => {
            return new uml.Generalization({
                attrs: {
                    line: {
                        stroke: '#F473B9'
                    }
                }
            });
        }
    } else if(type === "Imp"){
        paper.options.defaultLink = (elementView, magnet) => {
            return new uml.Implementation({
                attrs: {
                    line: {
                        stroke: '#F473B9'
                    }
                }
            });
        }
    } else if(type === "Agr"){
        paper.options.defaultLink = (elementView, magnet) => {
            return new uml.Aggregation({
                attrs: {
                    line: {
                        stroke: '#F473B9'
                    }
                }
            });
        }
        
    } else if(type === "Comp"){
        paper.options.defaultLink = (elementView, magnet) => {
            return new uml.Composition({
                attrs: {
                    line: {
                        stroke: '#F473B9'
                    }
                }
            });
        }
    }
}

function about(){
    const newTab = window.open("about.html", '_blank');
    newTab.focus();
}
terjemah.addEventListener('click', function() {
    var allElement = graph.getElements();
    if (allElement.length === 0) {
        alert('Mohon rancang diagram kelas terlebih dahulu sebelum menerjemahkannya!');
        $(modalTrans).modal("hide");
    } else {
        $(modalTrans).modal("show");
        const translation = new Translation(allElement);
        translation.generateData();
    }
});

ekspor.addEventListener('click', function() {
    var allElement = graph.getElements();
    const captureElement = document.querySelector('#myholder');
    if (allElement.length === 0) {
        alert('Mohon rancang diagram kelas terlebih dahulu sebelum mengekspornya!');
        $(modalEks).modal("hide");
    } else {
        $(modalEks).modal("show");
        const diagram = new Diagram(captureElement, null);
        diagram.generateData();
    }
});