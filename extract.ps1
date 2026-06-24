$word = New-Object -ComObject Word.Application
$word.Visible = $false

$doc = $word.Documents.Open("c:\Users\chhim\OneDrive\Desktop\hotel booking system\Product Requirement Document.docx")
$doc.Content.Text | Out-File -FilePath "c:\Users\chhim\OneDrive\Desktop\hotel booking system\PRD.txt" -Encoding UTF8
$doc.Close()

$doc2 = $word.Documents.Open("c:\Users\chhim\OneDrive\Desktop\hotel booking system\Software Design Document.docx")
$doc2.Content.Text | Out-File -FilePath "c:\Users\chhim\OneDrive\Desktop\hotel booking system\SDD.txt" -Encoding UTF8
$doc2.Close()

$word.Quit()
