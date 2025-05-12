
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Router {

    private record Packet(int source, int destination, int timestamp) {}

    private class Timestamps {
        int startIndex;
        List<Integer> timestamps = new ArrayList<>();
    }

    private static final int[] THERE_ARE_NO_PACKETS = new int[]{};
    private static final int PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE = 0;

    private final int memoryLimit;
    private final ArrayDeque<Packet> packets;
    private final Set<Packet> quickAccessPackets;
    private final Map<Integer, Timestamps> destinationToTimestamps;

    public Router(int memoryLimit) {
        this.memoryLimit = memoryLimit;
        packets = new ArrayDeque<>();
        quickAccessPackets = new HashSet<>();
        destinationToTimestamps = new HashMap<>();
    }

    public boolean addPacket(int source, int destination, int timestamp) {
        Packet packet = new Packet(source, destination, timestamp);

        if (quickAccessPackets.contains(packet)) {
            return false;
        }

        if (packets.size() == memoryLimit) {
            Packet toRemove = packets.removeFirst();
            quickAccessPackets.remove(toRemove);
            ++destinationToTimestamps.get(toRemove.destination).startIndex;
        }

        packets.addLast(packet);
        quickAccessPackets.add(packet);
        destinationToTimestamps.putIfAbsent(destination, new Timestamps());
        destinationToTimestamps.get(destination).timestamps.add(timestamp);

        return true;
    }

    public int[] forwardPacket() {
        if (packets.isEmpty()) {
            return THERE_ARE_NO_PACKETS;
        }

        Packet toRemove = packets.removeFirst();
        quickAccessPackets.remove(toRemove);
        ++destinationToTimestamps.get(toRemove.destination).startIndex;

        return new int[]{toRemove.source, toRemove.destination, toRemove.timestamp};
    }

    public int getCount(int destination, int startTime, int endTime) {
        if (!destinationToTimestamps.containsKey(destination)) {
            return PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }

        List<Integer> timestamps = destinationToTimestamps.get(destination).timestamps;
        int startIndex = destinationToTimestamps.get(destination).startIndex;
        int endIndex = destinationToTimestamps.get(destination).timestamps.size() - 1;

        if (startIndex > endIndex
                || startIndex == timestamps.size()
                || timestamps.get(startIndex) > endTime
                || timestamps.get(endIndex) < startTime) {
            return PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }
        while (startIndex < endIndex && timestamps.get(startIndex) < startTime) {
            ++startIndex;
        }
        while (endIndex > 0 && timestamps.get(endIndex) > endTime) {
            --endIndex;
        }
        return endIndex - startIndex + 1;
    }
}
