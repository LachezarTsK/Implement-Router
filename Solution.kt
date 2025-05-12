
class Router(private val memoryLimit: Int) {

    private data class Packet(val source: Int, val destination: Int, val timestamp: Int) {}

    private class Timestamps {
        var startIndex = 0
        val timestamps = ArrayList<Int>()
    }

    private companion object {
        val THERE_ARE_NO_PACKETS = IntArray(0)
        const val PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE = 0
    }

    private val packets = ArrayDeque<Packet>()
    private val quickAccessPackets = HashSet<Packet>()
    private val destinationToTimestamps = HashMap<Int, Timestamps>()

    fun addPacket(source: Int, destination: Int, timestamp: Int): Boolean {
        val packet = Packet(source, destination, timestamp)

        if (quickAccessPackets.contains(packet)) {
            return false
        }

        if (packets.size == memoryLimit) {
            val toRemove = packets.removeFirst()
            quickAccessPackets.remove(toRemove)
            ++destinationToTimestamps[toRemove.destination]!!.startIndex
        }

        packets.addLast(packet)
        quickAccessPackets.add(packet)
        destinationToTimestamps.putIfAbsent(destination, Timestamps())
        destinationToTimestamps[destination]!!.timestamps.add(timestamp)

        return true
    }

    fun forwardPacket(): IntArray {
        if (packets.isEmpty()) {
            return THERE_ARE_NO_PACKETS
        }

        val toRemove = packets.removeFirst()
        quickAccessPackets.remove(toRemove)
        ++destinationToTimestamps[toRemove.destination]!!.startIndex

        return intArrayOf(toRemove.source, toRemove.destination, toRemove.timestamp)
    }

    fun getCount(destination: Int, startTime: Int, endTime: Int): Int {
        if (!destinationToTimestamps.containsKey(destination)) {
            return PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE
        }

        val timestamps = destinationToTimestamps[destination]!!.timestamps
        var startIndex = destinationToTimestamps[destination]!!.startIndex
        var endIndex = destinationToTimestamps[destination]!!.timestamps.size - 1

        if (startIndex > endIndex
            || startIndex == timestamps.size
            || timestamps[startIndex] > endTime
            || timestamps[endIndex] < startTime
        ) {
            return PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE
        }
        while (startIndex < endIndex && timestamps[startIndex] < startTime) {
            ++startIndex
        }
        while (endIndex > 0 && timestamps[endIndex] > endTime) {
            --endIndex
        }
        return endIndex - startIndex + 1
    }
}
