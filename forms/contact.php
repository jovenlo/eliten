<?php
  /**
  * Requires the "PHP Email Form" library
  * The "PHP Email Form" library is available only in the pro version of the template
  * The library should be uploaded to: vendor/php-email-form/php-email-form.php
  * For more info and help: https://bootstrapmade.com/php-email-form/
  */

  // Replace contact@example.com with your real receiving email address
  $receiving_email_address = 'joshva2003dj@gmail.com';

  if( file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php' )) {
    include( $php_email_form );
  } else {
    die( 'Unable to load the "PHP Email Form" Library!');
  }

  $contact = new PHP_Email_Form;
  $contact->ajax = true;
  
  $contact->to = $receiving_email_address;
  $contact->from_name = $_POST['name'];
  $contact->from_email = $_POST['email'];
  $contact->subject = $_POST['subject'];

  // Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
  /*
  $contact->smtp = array(
    'host' => 'example.com',
    'username' => 'example',
    'password' => 'pass',
    'port' => '587'
  );
  */

  $contact->add_message( $_POST['name'], 'From');
  $contact->add_message( $_POST['email'], 'Email');
  $contact->add_message( $_POST['message'], 'Message', 10);

  // Enable error reporting for debugging
  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  // Get form data and sanitize inputs
  $name = filter_var($_POST['name'] ?? '', FILTER_SANITIZE_STRING);
  $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
  $subject = filter_var($_POST['subject'] ?? '', FILTER_SANITIZE_STRING);
  $message = filter_var($_POST['message'] ?? '', FILTER_SANITIZE_STRING);

  // Validate required fields
  if (empty($name) || empty($email) || empty($subject) || empty($message)) {
      echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
      exit;
  }

  // Validate email format
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
      exit;
  }

  // Set recipient email
  $to = 'joshva2003dj@gmail.com';

  // Set email headers with additional security
  $headers = "From: $name <$email>\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
  $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

  // Create email body with proper HTML formatting
  $email_body = "
<!DOCTYPE html>
<html>
<head>
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong></p>
            <p>" . nl2br(htmlspecialchars($message)) . "</p>
        </div>
        <div class='footer'>
            <p>This email was sent from your website contact form</p>
        </div>
    </div>
</body>
</html>
";

  // Send email with error handling
  try {
      $mail_sent = mail($to, $subject, $email_body, $headers);
      
      if ($mail_sent) {
          // Log successful email
          error_log("Email sent successfully to $to from $email");
          echo json_encode(['status' => 'success', 'message' => 'Your message has been sent successfully.']);
      } else {
          // Log email failure
          error_log("Failed to send email to $to from $email");
          echo json_encode(['status' => 'error', 'message' => 'Failed to send message. Please try again later.']);
      }
  } catch (Exception $e) {
      // Log any exceptions
      error_log("Email sending error: " . $e->getMessage());
      echo json_encode(['status' => 'error', 'message' => 'An error occurred while sending the message.']);
  }
?>
