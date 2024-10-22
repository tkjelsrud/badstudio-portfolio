let tableId = "badReleases";
let columns = new Array();
// TSV data from google
let dataTsv = `Date	Icon	Title	Description	Track list	Format	ISIN	Link
2023		Ambijens			Cassette & EP		
2023		Neon Horizon			Single		
2022		Ambijens			EP		
2021		Guitar and Drum			EP		
2021		Undecide ft. Japee (radomix)			Single		
2021		Mindful ft. Japee (demo)			Single		
2019		Ambient 6 LNNS			Single		
2017		Cassette Dub #1			Single		
2016		Oid			Single		`;

function processData() {
    let lines = dataTsv.split("\n");
    console.log(lines);
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let data = line.trim().split("\t");
        let tid = data[0];
        //let fil = data.slice(1);
        insertRow(tableId, data);
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

processData();

function loadReleaseData(jsonFile) {
    let releaseInfo = "";
    // Fetch the JSON file passed as a parameter
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            // Assuming you want to display the first release object
            const release = data[0];

            // Create an HTML structure to display the release data
            releaseInfo = `
                <h2>${release.workingTitle || 'Untitled'} (${release.year})</h2>
                <p><strong>State:</strong> ${release.state}</p>
                <p><strong>Format:</strong> ${release.format}</p>
                <p><strong>Release Date:</strong> ${release.releaseDate || 'TBD'}</p>
                <p><strong>BPM:</strong> ${release.production.bpm}</p>
                <p><strong>Key:</strong> ${release.production.key}</p>
                <p><strong>Instruments:</strong></p>
                <ul>
                    <li>Synth: ${release.production.instruments.synth}</li>
                    <li>Sampler: ${release.production.instruments.sampler}</li>
                    <li>Drum Samples: ${release.production.instruments.drum_samples}</li>
                </ul>
                <p><strong>Writer:</strong> ${release.credits.writer}</p>
                <p><strong>Lyrics:</strong> <a href="${release.lyricsUrl}">${release.lyricsUrl}</a></p>
            `;
        })
        .catch(error => console.error('Error fetching the JSON data:', error));

    return releaseInfo;
}