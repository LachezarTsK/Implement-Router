
// const {Queue} = require('@datastructures-js/queue');
/*
 Queue is internally included in the solution file on leetcode.
 When running the code on leetcode it should stay commented out. 
 It is mentioned here just for information about the external library 
 that is applied for this data structure.
 */

class Router {

    static #THERE_ARE_NO_PACKETS = new Array();
    static #PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE = 0;

    #memoryLimit;
    #packets;
    #quickAccessPackets;
    #destinationToTimestamps;

    /**
     * @param {number} memoryLimit
     */
    constructor(memoryLimit) {
        this.#memoryLimit = memoryLimit;
        this.#packets = new Queue();//Queue<Packet>
        this.#quickAccessPackets = new Set();//Set<string> => Set<convertPacketToString(packet)>
        this.#destinationToTimestamps = new Map();//Map<number, Timestamps>
    }

    /** 
     * @param {number} source 
     * @param {number} destination 
     * @param {number} timestamp
     * @return {boolean}
     */
    addPacket(source, destination, timestamp) {
        const packet = new Packet(source, destination, timestamp);
        const packetAsString = this.convertPacketToString(packet);

        if (this.#quickAccessPackets.has(packetAsString)) {
            return false;
        }

        if (this.#packets.size() === this.#memoryLimit) {
            const toRemove = this.#packets.dequeue();
            const toRemoveAsString = this.convertPacketToString(toRemove);

            this.#quickAccessPackets.delete(toRemoveAsString);
            ++this.#destinationToTimestamps.get(toRemove.destination).startIndex;
        }

        this.#packets.enqueue(packet);
        this.#quickAccessPackets.add(packetAsString);

        if (!this.#destinationToTimestamps.has(destination)) {
            this.#destinationToTimestamps.set(destination, new Timestamps());
        }
        this.#destinationToTimestamps.get(destination).timestamps.push(timestamp);

        return true;
    }

    /**
     * @return {number[]}
     */
    forwardPacket() {
        if (this.#packets.isEmpty()) {
            return Router.#THERE_ARE_NO_PACKETS;
        }

        const toRemove = this.#packets.dequeue();
        const toRemoveAsString = this.convertPacketToString(toRemove);

        this.#quickAccessPackets.delete(toRemoveAsString);
        ++this.#destinationToTimestamps.get(toRemove.destination).startIndex;

        return [toRemove.source, toRemove.destination, toRemove.timestamp];
    }

    /** 
     * @param {number} destination 
     * @param {number} startTime 
     * @param {number} endTime
     * @return {number}
     */
    getCount(destination, startTime, endTime) {
        if (!this.#destinationToTimestamps.has(destination)) {
            return Router.#PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }

        const timestamps = this.#destinationToTimestamps.get(destination).timestamps;
        let startIndex = this.#destinationToTimestamps.get(destination).startIndex;
        let endIndex = this.#destinationToTimestamps.get(destination).timestamps.length - 1;

        if (startIndex > endIndex
                || startIndex === timestamps.length
                || timestamps[startIndex] > endTime
                || timestamps[endIndex] < startTime) {
            return Router.#PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }
        while (startIndex < endIndex && timestamps[startIndex] < startTime) {
            ++startIndex;
        }
        while (endIndex > 0 && timestamps[endIndex] > endTime) {
            --endIndex;
        }
        return endIndex - startIndex + 1;
    }

    /** 
     * @param {Packet} packet 
     * @return {string}
     */
    convertPacketToString(packet) {
        return packet.source + "," + packet.destination + "," + packet.timestamp;
    }
}

/** 
 * @param {number} source 
 * @param {number} destination 
 * @param {number} timestamp
 */
function Packet(source, destination, timestamp) {
    this.source = source;
    this.destination = destination;
    this.timestamp = timestamp;
}

function Timestamps() {
    this.startIndex = 0;
    this.timestamps = new Array();//Array<number>
}
