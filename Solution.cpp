
#include <deque>
#include <vector>
#include <unordered_set>
#include <unordered_map>
using namespace std;

class Router {

    struct Packet {

        int source = 0;
        int destination = 0;
        int timestamp = 0;

        Packet() = default;
        Packet(int source, int destination, int timestamp) :
                source{ source }, destination{ destination }, timestamp{ timestamp } {
        }
    };

    inline static auto EqualPacket = [](const Packet& first, const Packet& second) {
        return first.source == second.source
                && first.destination == second.destination
                && first.timestamp == second.timestamp;
    };

    inline static auto HashPacket = [](const Packet& packet) {
        size_t h = (hash<int>()(packet.source))
                ^ (hash<int>()(packet.destination))
                ^ (hash<int>()(packet.timestamp));
        return h * (h << 1);
    };

    struct Timestamps {
        int startIndex = 0;
        vector<int> timestamps;
    };

    inline static const vector<int> THERE_ARE_NO_PACKETS;
    static const int PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE = 0;

    int memoryLimit = 0;
    deque<Packet> packets;
    unordered_set<Packet, decltype(HashPacket), decltype(EqualPacket)> quickAccessPackets;
    unordered_map<int, Timestamps> destinationToTimestamps;

public:
    Router(int memoryLimit) :memoryLimit{ memoryLimit } {}

    bool addPacket(int source, int destination, int timestamp) {
        Packet packet = Packet(source, destination, timestamp);

        if (quickAccessPackets.contains(packet)) {
            return false;
        }

        if (packets.size() == memoryLimit) {
            Packet toRemove = packets.front();
            packets.pop_front();
            quickAccessPackets.erase(toRemove);
            ++destinationToTimestamps[toRemove.destination].startIndex;
        }

        packets.emplace_back(source, destination, timestamp);
        quickAccessPackets.emplace(source, destination, timestamp);
        destinationToTimestamps[destination].timestamps.push_back(timestamp);

        return true;
    }

    vector<int> forwardPacket() {
        if (packets.empty()) {
            return THERE_ARE_NO_PACKETS;
        }

        Packet toRemove = packets.front();
        packets.pop_front();
        quickAccessPackets.erase(toRemove);
        ++destinationToTimestamps[toRemove.destination].startIndex;

        return { toRemove.source, toRemove.destination, toRemove.timestamp };
    }

    int getCount(int destination, int startTime, int endTime) {
        if (!destinationToTimestamps.contains(destination)) {
            return PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }

        vector<int>& timestamps = destinationToTimestamps[destination].timestamps;
        int startIndex = destinationToTimestamps[destination].startIndex;
        int endIndex = destinationToTimestamps[destination].timestamps.size() - 1;

        if (startIndex > endIndex
            || startIndex == timestamps.size()
            || timestamps[startIndex] > endTime
            || timestamps[endIndex] < startTime) {
            return PACKETS_NOT_FOUND_FOR_GIVEN_TIMESTAMP_RANGE;
        }
        while (startIndex < endIndex && timestamps[startIndex] < startTime) {
            ++startIndex;
        }
        while (endIndex > 0 && timestamps[endIndex] > endTime) {
            --endIndex;
        }
        return endIndex - startIndex + 1;
    }
};
