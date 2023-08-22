var upload = document.getElementById("fileinput");

let javas = [];

function workspace() {
    window.location.href = "operate.html";
}

// Simple JavaScript Promise that reads a file as text.
function readFileAsText(file){
    return new Promise(function(resolve,reject){
        let fr = new FileReader();
   
        fr.onload = function(){
            resolve(fr.result);
        };
   
        fr.onerror = function(){
            reject(fr);
        };
   
        fr.readAsText(file);
    });
   }
   
// Handle multiple fileuploads
upload.addEventListener("change", function(ev){
    javas = [];
    let files = ev.currentTarget.files;
    let readers = [];
   
    // Abort if there were no files selected
    if(!files.length) return;
   
    // Store promises in array
    for(let i = 0;i < files.length;i++){
        readers.push(readFileAsText(files[i]));
    }  
    
    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        for(i = 0; i < values.length; i++){
            javas.push(values[i]);
        }
    });
}, false); 

function cek() {
    if(javas.length < 1){
        alert("Mohon unggah kode JAVA terlebih dahulu");
    } else {
        var classRegex = /(?:public|protected|private)?\s*(abstract)?\s*(class|interface)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:(extends|implements)\s+([A-Za-z_][A-Za-z0-9_]*))?/g;
        //var attributeRegex = /(?:public|protected|private)?\s+\w+\s+([A-Za-z_][A-Za-z0-9_<> ,>\s]*)\s*(?:=.*?|);/g;
        var attributeRegex2 = /^(?:(?!\/\/).)*?\b(?:public\s+)?\w+\s+([A-Za-z_][A-Za-z0-9_<> ,>\s]*)\s*(?:=.*?|);/gm; // kalo ada komen
        var methodRegex = /((?:public|protected|private)?)\s*(\w+)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*(?:{|;)/g;
        var aggRegex = /[A-Za-z]+\s+[A-Za-z]+<[A-Za-z]+>\s+[A-Za-z]+;/g;

        var list_atr = [];
        var list_meth = [];
        var list_class = [];
        var list_agg = [];
        
        var wholeClass = [];
        
        for(i = 0; i < javas.length; i++){
            var className = javas[i].match(classRegex);
            var classDeclaration = className[0].trim();
            //var attributeDeclarations = javas[i].match(attributeRegex);
            var aggAtrs = javas[i].match(aggRegex);
            var methodDeclarations = javas[i].match(methodRegex).filter(match => !/\bnew\s+\w+\(/.test(match));
            var methodDeclarations2 = javas[i].match(methodRegex);

            // buat attributeRegex2
            let match;
            let matches = [];
            while ((match = attributeRegex2.exec(javas[i])) !== null) {
                matches.push(match[0])
            }
            list_atr.push(matches)              
            list_class.push(classDeclaration);
            //list_atr.push(attributeDeclarations);
            console.log('list_atr',list_atr);
            list_meth.push(methodDeclarations);
            console.log('list_meth',list_meth);
            list_agg.push(aggAtrs);
        }
        var classNames = [];
        for (var i = 0; i < list_class.length; i++) {
            var words = list_class[i].split(" ");
            
            if(words[0].toLowerCase() !== "public") {
                if(words[0] === "abstract"){
                    classNames.push(words[2]);
                } else {
                    classNames.push(words[1]);
                }
            } else {
                if(words[1] === "abstract"){
                    classNames.push(words[3]);
                } else {
                    classNames.push(words[2]);
                }
            }
        }
        
        if(list_atr !== null){
            for (var i = 0; i < list_atr.length; i++) {
                if(list_atr[i] !== null){
                    for (var j = 0; j < list_atr[i].length; j++) {
                        list_atr[i][j] = list_atr[i][j].replace(/^\s+/, '')
                    }
                    const attributeRegex = /^(?:(?!\/\/).)*?\b(?:public\s+)?\w+\s+([A-Za-z_][A-Za-z0-9_<> ,>\s]*)\s*(?:=.*?|);/m;
                    list_atr[i] = list_atr[i].filter(item => attributeRegex.test(item) && !item.includes("return") && !item.includes("="));
                } else {
                    list_atr_curr = "";
                }
            // filter.push(filteredList);
            //     var list_atr_curr = list_atr[i];
            //     if(list_atr_curr !== null){
            //         for (var j = 0; j < list_atr_curr.length; j++) {
            //             list_atr_curr[j] = list_atr_curr[j].replace(/\r|\n/g, '');
            //             // const attributeRegex = /^(?:[a-zA-Z]+\s+){0,2}[a-zA-Z]+\s+[a-zA-Z0-9!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/]+\s*;$/g;
            //             const attributeRegex = /(?:public|protected|private)?\s+\w+\s+([A-Za-z_][A-Za-z0-9_<> ,>\s]*)\s*(?:=.*?|)/g;
            //             if(!list_atr_curr[j].match(attributeRegex) || list_atr_curr[j].includes("return")){
            //                 list_atr_curr.splice(j, 1);
            //                 j--; // Decrement j to adjust for the removed element
            //             }
            //         }
            //     } else {
            //         list_atr_curr = "";
            //     }
            }
        } else {
            list_atr = "";
        }
        
        for (var i = 0; i < classNames.length; i++) {
            var class_curr = classNames[i];
            if(list_meth[i] !== null){
                for (var j = 0; j < list_meth[i].length; j++) {
                    if(list_meth[i][j] !== null){
                        list_meth[i][j] = list_meth[i][j].replace(/^\s+/, '');
                        if(list_meth[i][j].includes(class_curr)){
                            list_meth[i].splice(j, 1); // hapus elemen dari list_meth[i] pada indeks j
                            j--; // kurangi nilai j karena ukuran list_meth[i] berkurang setelah penghapusan elemen
                        }
                    } else {
                        list_meth[i][j] = "";
                    }
                }
            }
        }

        // Asosiasi
        const list_aso = [];
        const list_agg2 = [];
        const list_comp = [];
        const list_dep = [];

        for (var i = 0; i < javas.length; i++) {
        var asoResults = [];
        var aggResults = [];
        var compResults = [];
        var depResults = [];

        for (var j = 0; j < classNames.length; j++) {
            var asoRegex = new RegExp(`\\bset${classNames[j]}\\b`, "g");
            var aggRegex = new RegExp(`\\bthis\\.${classNames[j].toLowerCase()}\\b\\s*=\\s*${classNames[j].toLowerCase()}\\s*;`, "g");
            var compRegex = new RegExp(`\\bthis\\.${classNames[j].toLowerCase()}\\b\\s*=\\s*new\\s+(${classNames[j]})\\s*\\(.*?\\)`, "g");
            var depRegex = new RegExp(`this\\.${classNames[j].toLowerCase()}\\.`, "g");

            const asoMatches = javas[i].match(asoRegex);
            if (asoMatches) {
            asoResults.push(...asoMatches);
            }

            const aggMatches = javas[i].match(aggRegex);
            if (aggMatches) {
            aggResults.push(...aggMatches);
            }

            const compMatches = javas[i].match(compRegex);
            if (compMatches) {
            compResults.push(...compMatches);
            }

            const depMatches = javas[i].match(depRegex);
            if (depMatches) {
            depResults.push(...depMatches);
            }
        }

        list_aso.push(asoResults);
        list_agg2.push(aggResults);
        list_comp.push(compResults);
        list_dep.push(depResults);
        }


        for (var i = 0; i < list_class.length; i++) {
            var innerArray = [list_class[i], list_atr[i], list_meth[i], list_agg[i], list_agg2[i], list_aso[i], list_comp[i], list_dep[i]];
            wholeClass.push(innerArray);
        }
        
        var arrayString = JSON.stringify(wholeClass);
        console.log(wholeClass);
        localStorage.setItem('classes', arrayString);
        window.location.href = "operate.html";
    }
}
