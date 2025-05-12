
// const {Queue} = require('@datastructures-js/queue');
/*
 Queue is internally included in the solution file on leetcode.
 When running the code on leetcode it should stay commented out. 
 It is mentioned here just for information about the external library 
 that is applied for this data structure.
 */

class Router {

    private static THERE_ARE_NO_PACKETS = new Array();
    private static PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE = 0;

    private memoryLimit: number;
    private packets: Queue<Packet>;
    private quickAccessPackets: Set<String>;//Set<convertPacketToString(packet)>
    private destinationToTimestamps: Map<number, Timestamps>;

    constructor(memoryLimit: number) {
        this.memoryLimit = memoryLimit;
        this.packets = new Queue<Packet>();
        this.quickAccessPackets = new Set<string>();
        this.destinationToTimestamps = new Map<number, Timestamps>();
    }

    addPacket(source: number, destination: number, timestamp: number): boolean {
        const packet = new Packet(source, destination, timestamp);
        const packetAsString = this.convertPacketToString(packet);

        if (this.quickAccessPackets.has(packetAsString)) {
            return false;
        }

        if (this.packets.size() === this.memoryLimit) {
            const toRemove = this.packets.dequeue();
            const toRemoveAsString = this.convertPacketToString(toRemove);

            this.quickAccessPackets.delete(toRemoveAsString);
            ++this.destinationToTimestamps.get(toRemove.destination).startIndex;
        }

        this.packets.enqueue(packet);
        this.quickAccessPackets.add(packetAsString);

        if (!this.destinationToTimestamps.has(destination)) {
            this.destinationToTimestamps.set(destination, new Timestamps());
        }
        this.destinationToTimestamps.get(destination).timestamps.push(timestamp);

        return true;
    }

    forwardPacket(): number[] {
        if (this.packets.isEmpty()) {
            return Router.THERE_ARE_NO_PACKETS;
        }

        const toRemove = this.packets.dequeue();
        const toRemoveAsString = this.convertPacketToString(toRemove);

        this.quickAccessPackets.delete(toRemoveAsString);
        ++this.destinationToTimestamps.get(toRemove.destination).startIndex;

        return [toRemove.source, toRemove.destination, toRemove.timestamp];
    }

    getCount(destination: number, startTime: number, endTime: number): number {
        if (!this.destinationToTimestamps.has(destination)) {
            return Router.PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }

        const timestamps = this.destinationToTimestamps.get(destination).timestamps;
        let startIndex = this.destinationToTimestamps.get(destination).startIndex;
        let endIndex = this.destinationToTimestamps.get(destination).timestamps.length - 1;

        if (startIndex > endIndex
            || startIndex === timestamps.length
            || timestamps[startIndex] > endTime
            || timestamps[endIndex] < startTime) {
            return Router.PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }
        while (startIndex < endIndex && timestamps[startIndex] < startTime) {
            ++startIndex;
        }
        while (endIndex > 0 && timestamps[endIndex] > endTime) {
            --endIndex;
        }
        return endIndex - startIndex + 1;
    }

    convertPacketToString(packet: Packet): string {
        return packet.source + "," + packet.destination + "," + packet.timestamp;
    }
}



class Packet {

    source: number;
    destination: number;
    timestamp: number;

    constructor(source, destination, timestamp) {
        this.source = source;
        this.destination = destination;
        this.timestamp = timestamp;
    }
}

class Timestamps {

    startIndex: number;
    timestamps: number[];

    constructor() {
        this.startIndex = 0;
        this.timestamps = new Array();
    }
}
