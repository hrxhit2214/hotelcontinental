$bytes = [System.IO.File]::ReadAllBytes("c:\Users\chhim\OneDrive\Desktop\hotel booking system\Continentals_Tech_Stack_Requirements.pdf")
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Extract text between BT and ET markers (PDF text objects)
$textBlocks = [regex]::Matches($content, 'BT\s*(.*?)\s*ET', [System.Text.RegularExpressions.RegexOptions]::Singleline)

$allText = ""
foreach ($block in $textBlocks) {
    $blockContent = $block.Groups[1].Value
    # Extract text from Tj and TJ operators
    $tjMatches = [regex]::Matches($blockContent, '\(([^\)]*)\)')
    foreach ($tj in $tjMatches) {
        $allText += $tj.Groups[1].Value
    }
    $allText += "`n"
}

$allText | Out-File -FilePath "c:\Users\chhim\OneDrive\Desktop\hotel booking system\TechStack.txt" -Encoding UTF8
Write-Host "Extracted PDF text successfully"
Write-Host $allText
