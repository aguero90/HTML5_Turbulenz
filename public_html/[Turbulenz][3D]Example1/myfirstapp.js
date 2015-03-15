// questi commenti li userà il compilatore dell'engine
// per trasformarli in modo adeguato a seconda della modalità
// di compilazione
// es: canvas: viene tutto inserito all'interno di un singolo file
//     canvas-debug: vengono linkati e lasciati in file separati

/*{{ javascript("jslib/camera.js") }}*/
/*{{ javascript("jslib/floor.js") }}*/
/*{{ javascript("jslib/requesthandler.js") }}*/
/*{{ javascript("jslib/observer.js") }}*/

// entry point dell'applicazione
// viene chiamata nel momento in cui l'engine è stato caricato
TurbulenzEngine.onload = function onloadFn() {

    // Questa callback viene chiamata nel momento in cui l'engine rileva un errore
    // ad esempo se vengono passati dei parametri errati
    TurbulenzEngine.onerror = function gameErrorFn(msg) {

        // Gestire qui l'errore usando msg per sapere qual è stato l'errore
        window.alert(msg);
    };



    // inizializzazioni
    var intervalID;
    var gd = TurbulenzEngine.createGraphicsDevice({});

    var md = TurbulenzEngine.createMathDevice({});

    // Fornisce le funzionalità per una camera 3D usando il sistema right-handed
    var camera = Camera.create(md);
    // camera.lookAt(target, up, origin);
    camera.lookAt(md.v3BuildZero(),
            md.v3Build(0, 1, 0),
            md.v3Build(0, 20, 100));

    // Oggetto che disegna un "pavimento" infinito ad altezza 0
    var floor = Floor.create(gd, md);


    var shader = null;
    var technique = null;

    // Load Shader
    // L'oggetto RequestHandler gestisce le richieste HTTP e cattura i seguenti
    // codici di risposta HTTP:
    //        0 - Connessione persa o richista girata ad un altro dominio
    //      408 - time-out
    //      429 - Troppe richieste
    //      480 - Temporaneamente non disponibile
    //
    // Offre inoltre la possibilità di gestire eventi di diverso tipo
    // aggiungendo e rimuovendo listener tramite addEventListener e removeEventListener
    var requestHandler = RequestHandler.create({});

    // requestHandler.request(src, requestOwner(optional), requestFn(Optional), onload, userData(optional));
    requestHandler.request({
        src: 'generic3D.cgfx.json', // URL da richiedere
        onload: function (shaderJSON) { // callback chiamata nel momento in cui la risorsa è stata caricata
            var shaderParameters = JSON.parse(shaderJSON); // trasforma il JSON in un oggetto
            shader = gd.createShader(shaderParameters); // crea uno shader: un container per la tecniche di shading
            technique = shader.getTechnique('vertexColor3D'); // prende la tecnica che ci interessa dal container
            // Vertex shader   - gestisce la posizione dei vertici di un oggetto,
            //                   pertanto ne può alterare solamente la forma
            //
            // Geometry shader - viene usato per combinare una serie di vertici per formare un oggetto più complesso
            //                   al quale applicare effetti di pixel shading: un'applicazione può definire dei GS che
            //                   prendono tre vertici di un triangolo e compiono un'operazione chiamata tassellazione,
            //                   creando automaticamente dei triangoli all'interno.
            //
            // Pixel shader    - elabora i singoli pixel di un oggetto, per applicare texture
            //                   o effetti come bump mapping o nebbia (calcola che colore avrà ogni pixel
            //                   in base alla texture applicata e all'illuminazione della scena).
        }
    });

    // Technique Parameters
    // Un container per le proprietà della tecnica
    // Le tecniche di shading necessitano avere delle proprietà settate prima
    // che questa possa essere renderizzata
    var techniqueParameters = gd.createTechniqueParameters({
        worldViewProjection: md.m44BuildIdentity()
    });

    // Create a vertex buffer for a cube
    var vertLBF = [-20, -20, +20, 1, 0, 0, 1];
    var vertLTF = [-20, +20, +20, 0, 1, 0, 1];
    var vertRTF = [+20, +20, +20, 0, 0, 1, 1];
    var vertRBF = [+20, -20, +20, 1, 1, 0, 1];
    var vertLBB = [-20, -20, -20, 0, 0, 1, 1];
    var vertLTB = [-20, +20, -20, 1, 1, 0, 1];
    var vertRTB = [+20, +20, -20, 1, 0, 0, 1];
    var vertRBB = [+20, -20, -20, 0, 1, 0, 1];
    // non ho capito bene perchè aggiunge tutti questi vertici per fare una faccia
    // sembra quasi che crei 2 triangoli rettangoli per fare un quadrato
    // prendiamo ad esempio front:
    // fa prima il triangolo rettangolo LTF -> LBF -> RTF
    // e poi il triangolo rettangolo RTF -> LBF -> RBF
    // che uniti formano la faccia frontale del cubo
    var vertData = [].concat(
            vertLTF, vertLBF, vertRTF, vertRTF, vertLBF, vertRBF, // front
            vertRTF, vertRBF, vertRTB, vertRTB, vertRBF, vertRBB, // right
            vertLTB, vertLBB, vertLTF, vertLTF, vertLBB, vertLBF, // left
            vertRTB, vertRBB, vertLTB, vertLTB, vertRBB, vertLBB, // back
            vertLTB, vertLTF, vertRTB, vertRTB, vertLTF, vertRTF, // top
            vertLBF, vertLBB, vertRBF, vertRBF, vertLBB, vertRBB // bottom
            );

    var numVerts = vertData.length;

    console.log(numVerts);
    console.log(vertData);

    var vertexBuffer = gd.createVertexBuffer({
        numVertices: numVerts,
        // non ho idea di cosa siano queste costanti xD
        attributes: [gd.VERTEXFORMAT_FLOAT3, gd.VERTEXFORMAT_UBYTE4N],
        data: vertData
    });

    // Semantics (bind vertices to shader inputs)
    // È un contenitore per le informazioni semantiche degli attributi dei vertici.
    // Si comporta come un array JS
    // non ho idea di cosa siano queste costanti xD
    var semantics = gd.createSemantics([gd.SEMANTIC_POSITION, gd.SEMANTIC_COLOR]);

    // Up vector
    var upVector = md.v3Build(0, 1, 0);


    // game loop
    function tick() {

        // gd.beginFrame() restituisce false se la tab del gioco non è attiva
        if (gd.beginFrame()) {

            // Qui vanno le istruzioni per renderizzare
            gd.clear([0.0, 1.0, 1.0, 1.0]);

            // Dovrebbe essere chiamata ogni volta che deve essere aggiornata la camera
            camera.updateViewMatrix();
            // Dovrebbe essere chiamata ogni volta che camera matrix viene modificata
            camera.updateViewProjectionMatrix();

            floor.render(gd, camera);

            // entriamo in questo if nel momento in cui lo shader è stato caricato e
            // la callback ha creato la tecnica
            if (technique) {

                var angle = (TurbulenzEngine.time / (4 * Math.PI)); // Calcola l'angolo di rotazione in base al tempo corrente
                angle = (angle - Math.floor(angle)) * (2 * Math.PI); // 0° <= angle <= 360° (2 * Math.PI)

                // crea una matrice 3x3 per la rotazione basandosi sull'angolo di rotazione
                var rotnMtx = md.m33FromAxisRotation(upVector, angle);
                // Otteniamo una matrice 4x4 come risultato della moltiplicazione tra
                // una matrice 3x3 ( rotnMtx )
                // una matrice 4x4 ( camera.viewProjectionMatrix )
                // la matrice ottenuta sovrascrive la matrice identità che avevamo assegnato prima
                // var techniqueParameters = gd.createTechniqueParameters({ worldViewProjection: md.m44BuildIdentity() });
                // infatti il terzo parametro indica la destinazione del risultato
                // riassumendo: destination = mathDevice.m33MulM44(matrix3x3, matrix4x4, destination);
                techniqueParameters.worldViewProjection = md.m33MulM44(rotnMtx, camera.viewProjectionMatrix, techniqueParameters.worldViewProjection);

                // settiamo la tecnica attiva in questo momento
                // questo metodo dovrebbe essere chiamato solo tra beginFrame() e endFrame()
                gd.setTechnique(technique);
                // settiamo le prorietà per la tecnica attiva in questo momento
                // questo metodo dovrebbe essere chiamato solo tra beginFrame() e endFrame()
                gd.setTechniqueParameters(techniqueParameters);

                // c'è scritto
                // "Sets a VertexBuffer object to represent specific semantics."
                // ma non ho capito cosa fa xD
                gd.setStream(vertexBuffer, semantics);
                // "Draws a geometry defined only by the active VertexBuffer streams using the active Technique."
                // graphicsDevice.draw(primitive, numVertices, first);
                // le possibili primitive sono:
                //      PRIMITIVE_TRIANGLES
                //      PRIMITIVE_TRIANGLE_STRIP
                //      PRIMITIVE_TRIANGLE_FAN
                //      PRIMITIVE_LINES
                //      PRIMITIVE_LINE_LOOP
                //      PRIMITIVE_LINE_STRIP
                //      PRIMITIVE_POINTS
                //
                // first è un parametro opzionale ( che di default vale 0 ) ed è:
                // "Offset from the beginning of the buffer in vertices"
                gd.draw(gd.PRIMITIVE_TRIANGLES, numVerts, 0);
            }

            gd.endFrame();
        }
    }


    // Possiamo vederlo come un exit point: nel momento in cui l'engine sta per
    // "spegnersi" viene invocata questa callback.
    // Dovremmo usare questa funzione per distruggere tutti gli oggetti
    // creati nell'ordine giusto
    TurbulenzEngine.onunload = function gameOnunloadFn() {

        if (intervalID) {
            TurbulenzEngine.clearInterval(intervalID);
        }

        floor = null;
        camera = null;
        md = null;
        gd = null;
    };


    intervalID = TurbulenzEngine.setInterval(tick, 1000 / 60);
};
