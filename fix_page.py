
def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    stack = []
    line_no = 1
    col_no = 0
    
    for i, char in enumerate(content):
        if char == '\n':
            line_no += 1
            col_no = 0
            continue
        col_no += 1
        
        if char == '{':
            stack.append(('{', line_no, col_no))
        elif char == '}':
            if not stack:
                print(f"Extra }} at line {line_no}, col {col_no}")
            else:
                stack.pop()
        elif char == '(':
            stack.append(('(', line_no, col_no))
        elif char == ')':
            if not stack:
                print(f"Extra ) at line {line_no}, col {col_no}")
            else:
                stack.pop()
                
    for char, l, c in stack:
        print(f"Unclosed {char} from line {l}, col {c}")

check_balance('src/app/page.tsx')
