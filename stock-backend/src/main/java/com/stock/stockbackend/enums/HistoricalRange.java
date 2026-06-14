package com.stock.stockbackend.enums;

import com.stock.stockbackend.exception.StockApiException;
import java.util.Locale;

public enum HistoricalRange {
    ONE_DAY("1D", "5min", 78),
    ONE_WEEK("1W", "1h", 168),
    ONE_MONTH("1M", "1day", 30),
    ONE_YEAR("1Y", "1week", 52),
    ALL("ALL", "1month", 120);

    private final String value;
    private final String interval;
    private final int outputSize;

    HistoricalRange(String value, String interval, int outputSize) {
        this.value = value;
        this.interval = interval;
        this.outputSize = outputSize;
    }

    public String getValue() {
        return value;
    }

    public String getInterval() {
        return interval;
    }

    public int getOutputSize() {
        return outputSize;
    }

    public static HistoricalRange fromValue(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return ONE_DAY;
        }

        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        for (HistoricalRange range : values()) {
            if (range.value.equals(normalized)) {
                return range;
            }
        }

        throw new StockApiException("Unsupported range. Allowed values: 1D, 1W, 1M, 1Y, ALL");
    }
}
