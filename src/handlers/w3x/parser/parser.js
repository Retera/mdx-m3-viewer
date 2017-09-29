import BinaryReader from "../../../binaryreader";
import MpqArchive from "../../mpq/archive";
import W3xParserEnvironment from "./environment";
import W3xParserDoodads from "./doodads";
import W3xParserUnits from "./units";
import W3xParserModificationTables from "./modificationtables";

/**
 * @constructor
 * @param {ArrayBuffer} src
 */
function W3xParser(src) {
    var reader = new BinaryReader(src);

    if (reader.read(4) !== "HM3W") {
        this.onerror("InvalidSource", "WrongMagicNumber");
        return false;
    }

    reader.skip(4);

    this.name = reader.readUntilNull();
    this.flags = reader.readInt32();
    this.maxPlayers = reader.readInt32();

    let mpq = new MpqArchive();
    mpq.initialize(src);

    this.mpq = mpq;

    this.modifications = new Map();

    this.readTerrain();
    this.readDoodads();
    this.readUnits()
    this.readModifications();

    return true;
}

W3xParser.prototype = {
    readTerrain() {
        let file = this.mpq.getFile("war3map.w3e");

        if (file) {
            this.environment = new W3xParserEnvironment(new BinaryReader(file.buffer));
        }
    },

    readDoodads() {
        let file = this.mpq.getFile("war3map.doo");

        if (file) {
            this.doodads = new W3xParserDoodads(new BinaryReader(file.buffer));
        }
    },

    readUnits() {
        let file = this.mpq.getFile("war3mapUnits.doo");

        if (file) {
            this.units = new W3xParserUnits(new BinaryReader(file.buffer));
        }
    },

    readModifications() {
        // useOptionalInts:
        //      w3u: no (units)
        //      w3t: no (items)
        //      w3b: no (destructables)
        //      w3d: yes (doodads)
        //      w3a: yes (abilities)
        //      w3h: no (buffs)
        //      w3q: yes (upgrades)
        this.readModificationTable("units", "war3map.w3u", false);
        this.readModificationTable("items", "war3map.w3t", false);
        this.readModificationTable("destructables", "war3map.w3b", false);
        this.readModificationTable("doodads", "war3map.w3d", true);
        this.readModificationTable("abilities", "war3map.w3a", true);
        this.readModificationTable("buffs", "war3map.w3h", false);
        this.readModificationTable("upgrades", "war3map.w3q", true);
    },

    readModificationTable(type, path, useOptionalInts) {
        let file = this.mpq.getFile(path);

        if (file) {
            this.modifications.set(type, new W3xParserModificationTables(new BinaryReader(file.buffer), useOptionalInts));
        }
    }
};

export default W3xParser;
