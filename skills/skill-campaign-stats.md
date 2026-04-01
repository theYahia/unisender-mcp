# skill-campaign-stats

## Trigger
User says: "Статистика рассылки", "Как прошла кампания", "Campaign stats", "Show campaign results".

## Steps

1. **Get campaign_id** from user or ask.

2. **Get status**:
   ```
   get_campaign_status(campaign_id)
   ```

3. **Get delivery stats**:
   ```
   get_campaign_delivery_stats(campaign_id)
   ```

4. **Report**: Status, sent/delivered/opened/clicked counts, open rate, CTR, unsubscribes, spam complaints.
