let dataSrc = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBYXsm35FVAaMYw0Czu79YawaHtBZr7u1zmFErjWnoAiY7xE1GE31wtGBBMcZ5yTWr_6B5HR2-2x5V/pub?gid=0&single=true&output=tsv";
let tableId = "badReleases";
let columnLayout = new Array("Date", "Icon", "Title", "Description", "Track list", "Format", "ISIN", "Link");


/// pasted

fetch(dataSrc)
    .then(function(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }).then(function(response) {
        response.text().then((body) => { 
              if (response.ok) {
                processData(body); 
              } else {
                console.log("error processing data"); 
                processData("");
              }
            })
  
    }).catch(function(error) {
        console.log(error);
        processData("");
    });

async function processData(text) {
      if(text == "") {
        return null;
        //fetch("/holtnesved-data.tsv"); // Fallback local file
        //text = await response.text();
        //console.log("local data used");
      }
      //console.log("PROCESSING DATA:", text);
      let lines = text.split("\n");
      for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if(line.startsWith("#")) {
            let data = line.trim().split("\t");
            let tid = data[0];
            let fil = data.slice(1);
            insertRow(tableId, fil);
        }
      }
}

function insertRow(tid, rowData) {
    let table = document.getElementById(tid);
    if(table) {
        let row = table.insertRow(-1);
        for(let j = 0; j < rowData.length; j++) {
            let cell = row.insertCell();
            cell.appendChild(document.createTextNode(rowData[j]));
        }
    }
}