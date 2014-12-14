(function (WH) {

	/**
	 * @constructor
	 */
	function Pattern(data) {
		this.events = {};
		this.size = 0;
		this.length = 0;
		if(data) {
			this.initFromData(data);
		}
	}

	Pattern.prototype = {

		/**
		 * Initialize pattern from data object
		 * @param {Object} data Pattern data object.
		 */
		initFromData: function(data) {

			this.length = data.length * 480;

			for(var i = 0; i < data.events.length; i++) {

				// create event from data
				var event = data.events[i];
				switch(event[0]) {
					case 'note': 
						// note-on
						this.push(WH.MidiEvent(
							Math.floor(event[1] * 480), 
							WH.MidiMessage(
								WH.MidiStatus.NOTE_ON, 
								data.channel, 
								event[3], 
								event[4])));
						// note-off
						this.push(WH.MidiEvent(
							Math.floor((event[1] + event[2]) * 480), 
							WH.MidiMessage(
								WH.MidiStatus.NOTE_OFF, 
								data.channel, 
								event[3], 
								0)));
						break;
				}

				// add end-of-track meta event
				this.push(WH.MidiEvent(
					Math.floor(this.length), 
					WH.MidiMessage(
						WH.MidiStatus.META_MESSAGE, 
						data.channel, 
						WH.MidiMetaStatus.END_OF_TRACK, 
						0)));
			}
		},

		/**
		 * Add an event to the pattern.
		 * @param {MidiEvent} event MIDI Event.
		 * @return {String} ID of the event.
		 */
		push: function (event) {
			var id = WH.getUid4();
			while (this.events.hasOwnProperty(id)) {
				id = WH.getUid4();
			}
			this.events[id] = event;
			this.size++;
			return id;
		}, 

		/**
		 * Find events to be played within a time span
		 * If the pattern is shorter than the sequence, the pattern will loop.
		 * 
		 * @param {Number} start Start time in ticks.
		 * @param {Number} end End time in ticks.
		 * @return {Array} An array with the events to be played within the time span.
		 */
		scanEventsInTimeSpan: function (start, end) {

			// convert sequence time to pattern time
			var localStart = start % this.length;
			var localEnd = localStart + (end - start);

			// get the events
			var bucket = [];
			for (var id in this.events) {
				var event = this.events[id];
				if (event) {
					if (localStart <= event.tick && event.tick <= localEnd) {
						// add new event with time relative to time span
						bucket.push(WH.MidiEvent((event.tick - localStart), event.message));
					}
				}
			}
			return (bucket.length > 0) ? bucket : null;
		},
	};

	/** 
	 * Exports
	 */
	WH.Pattern = function (data) {
		return new Pattern(data);
	};

})(WH);