# skill-send-campaign

## Trigger
User says: "Отправь рассылку", "Запусти кампанию", "Send campaign", "Send newsletter".

## Steps

1. **Clarify params** (if not provided):
   - List (`list_id`) — call `get_lists` to show available.
   - Subject (`subject`)
   - Body (`body`) — HTML
   - Sender name and email (`sender_name`, `sender_email`)

2. **Create email**:
   ```
   create_email(sender_name, sender_email, subject, body, list_id)
   -> message_id
   ```

3. **Send campaign**:
   ```
   send_email(message_id)
   -> campaign_id
   ```

4. **Confirm**: Show campaign_id, offer to check status via `get_campaign_status(campaign_id)`.
