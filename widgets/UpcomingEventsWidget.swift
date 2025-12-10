//
//  UpcomingEventsWidget.swift
//  Birthday Reminder Widget Extension
//
//  Note: This is a template for the WidgetKit extension
//  You'll need to create a Widget Extension target in Xcode
//  and implement this widget properly
//

import WidgetKit
import SwiftUI

struct UpcomingEventsWidget: Widget {
    let kind: String = "UpcomingEventsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: UpcomingEventsProvider()) { entry in
            UpcomingEventsEntryView(entry: entry)
        }
        .configurationDisplayName("Upcoming Celebrations")
        .description("See your upcoming birthdays and celebrations.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct UpcomingEventsProvider: TimelineProvider {
    func placeholder(in context: Context) -> UpcomingEventsEntry {
        UpcomingEventsEntry(
            date: Date(),
            events: [
                UpcomingEvent(name: "John", date: Date().addingTimeInterval(86400 * 2), type: "birthday"),
                UpcomingEvent(name: "Jane", date: Date().addingTimeInterval(86400 * 5), type: "nameday"),
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (UpcomingEventsEntry) -> ()) {
        let entry = UpcomingEventsEntry(
            date: Date(),
            events: loadUpcomingEvents()
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<UpcomingEventsEntry>) -> ()) {
        var entries: [UpcomingEventsEntry] = []
        let currentDate = Date()
        
        // Generate entries for the next 7 days
        for dayOffset in 0..<7 {
            let entryDate = Calendar.current.date(byAdding: .day, value: dayOffset, to: currentDate)!
            let entry = UpcomingEventsEntry(
                date: entryDate,
                events: loadUpcomingEvents(for: entryDate)
            )
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    private func loadUpcomingEvents(for date: Date = Date()) -> [UpcomingEvent] {
        // Load events from shared UserDefaults or App Group
        // This should match the data structure from your React Native app
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.yourcompany.birthdayreminder"),
              let data = sharedDefaults.data(forKey: "people"),
              let people = try? JSONDecoder().decode([Person].self, from: data) else {
            return []
        }
        
        // Filter and sort upcoming events
        let calendar = Calendar.current
        let upcoming = people
            .map { person -> UpcomingEvent? in
                guard let eventDate = parseDate(person.date) else { return nil }
                let nextOccurrence = nextYearlyOccurrence(of: eventDate, from: date)
                let daysUntil = calendar.dateComponents([.day], from: date, to: nextOccurrence).day ?? 0
                
                if daysUntil >= 0 && daysUntil <= 7 {
                    return UpcomingEvent(
                        name: person.name,
                        date: nextOccurrence,
                        type: person.type,
                        daysUntil: daysUntil
                    )
                }
                return nil
            }
            .compactMap { $0 }
            .sorted { $0.daysUntil < $1.daysUntil }
            .prefix(5)
        
        return Array(upcoming)
    }
    
    private func parseDate(_ dateString: String) -> Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: dateString)
    }
    
    private func nextYearlyOccurrence(of date: Date, from referenceDate: Date) -> Date {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.month, .day], from: date)
        var nextDate = calendar.date(bySetting: components, of: referenceDate) ?? referenceDate
        
        if nextDate < referenceDate {
            nextDate = calendar.date(byAdding: .year, value: 1, to: nextDate) ?? nextDate
        }
        
        return nextDate
    }
}

struct UpcomingEventsEntry: TimelineEntry {
    let date: Date
    let events: [UpcomingEvent]
}

struct UpcomingEvent {
    let name: String
    let date: Date
    let type: String
    let daysUntil: Int
}

struct Person: Codable {
    let id: String
    let name: String
    let date: String
    let type: String
}

struct UpcomingEventsEntryView: View {
    var entry: UpcomingEventsEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Upcoming")
                .font(.headline)
                .foregroundColor(.secondary)
            
            if entry.events.isEmpty {
                Text("No upcoming events")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.events.prefix(3), id: \.name) { event in
                    HStack {
                        Text(event.name)
                            .font(.body)
                        Spacer()
                        Text(formatDaysUntil(event.daysUntil))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .padding()
    }
    
    private func formatDaysUntil(_ days: Int) -> String {
        if days == 0 {
            return "Today"
        } else if days == 1 {
            return "Tomorrow"
        } else {
            return "In \(days) days"
        }
    }
}

@main
struct UpcomingEventsWidgetBundle: WidgetBundle {
    var body: some Widget {
        UpcomingEventsWidget()
    }
}

